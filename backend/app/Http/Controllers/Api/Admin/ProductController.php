<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ImageService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        $query = Product::with(['category', 'images']);

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()->paginate($request->input('per_page', 15));

        return ProductResource::collection($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0|gte:price',
            'cost' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'nullable|string|unique:products',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 2;
        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $product = Product::create([
            ...$request->except('slug'),
            'slug' => $slug,
        ]);

        return $this->successResponse(
            new ProductResource($product->load(['category', 'images'])),
            'Product created', 201
        );
    }

    public function show(Product $product)
    {
        return $this->successResponse(
            new ProductResource($product->load(['category', 'images', 'approvedReviews.user']))
        );
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => ['nullable', 'numeric', 'min:0', function ($attribute, $value, $fail) use ($request, $product) {
                $price = $request->input('price', $product->price);
                if ($value !== null && $value < $price) {
                    $fail('The compare price must be greater than or equal to the price.');
                }
            }],
            'cost' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'stock' => 'sometimes|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        $data = $request->only([
            'name', 'category_id', 'price', 'compare_price', 'cost',
            'description', 'short_description', 'sku', 'stock',
            'low_stock_threshold', 'is_active', 'is_featured', 'weight',
            'meta_title', 'meta_description',
        ]);
        if ($request->filled('name')) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 2;
            while (Product::withTrashed()->where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $data['slug'] = $slug;
        }

        $product->update($data);

        return $this->successResponse(
            new ProductResource($product->fresh()->load(['category', 'images'])),
            'Product updated'
        );
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return $this->successResponse(null, 'Product deleted');
    }

    public function toggleFeatured(Product $product)
    {
        $product->update(['is_featured' => !$product->is_featured]);
        return $this->successResponse(['is_featured' => $product->is_featured]);
    }

    public function toggleActive(Product $product)
    {
        $product->update(['is_active' => !$product->is_active]);
        return $this->successResponse(['is_active' => $product->is_active]);
    }

    public function uploadImages(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $imageService = app(ImageService::class);
        $uploaded = [];
        $existingCount = $product->images()->count();

        foreach ($request->file('images') as $index => $file) {
            $path = $imageService->upload($file, 'products');
            $image = ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'alt_text' => $product->name,
                'sort_order' => $existingCount + $index,
                'is_primary' => $existingCount === 0 && $index === 0,
            ]);
            $uploaded[] = $image;
        }

        return $this->successResponse($uploaded, 'Images uploaded', 201);
    }

    public function deleteImage(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return $this->errorResponse('Image does not belong to this product', 403);
        }

        app(ImageService::class)->delete($image->image_path);
        $image->delete();

        return $this->successResponse(null, 'Image deleted');
    }

    public function setPrimaryImage(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return $this->errorResponse('Image does not belong to this product', 403);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($product, $image) {
            $product->images()->update(['is_primary' => false]);
            $image->update(['is_primary' => true]);
        });

        return $this->successResponse(null, 'Primary image set');
    }
}
