<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $categories = Category::with(['children' => function ($q) {
            $q->active()->withCount('products');
        }])
            ->parents()->active()
            ->withCount('products')
            ->orderBy('sort_order')->get();

        // Include children's product count in parent total
        $categories->each(function ($cat) {
            $childrenCount = $cat->children->sum('products_count');
            $cat->products_count = $cat->products_count + $childrenCount;
        });

        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function show(Category $category, Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        $category->load('children');

        $categoryIds = collect([$category->id])
            ->merge($category->children->pluck('id'));

        $products = Product::with(['category', 'images'])
            ->active()
            ->whereIn('category_id', $categoryIds)
            ->latest()
            ->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'category' => new CategoryResource($category),
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
