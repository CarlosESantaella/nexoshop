<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ImageService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $categories = Category::with('children')
            ->parents()
            ->withCount('products')
            ->orderBy('sort_order')->get();

        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $data = $request->except('image');
        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 2;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }
        $data['slug'] = $slug;

        if ($request->hasFile('image')) {
            $data['image'] = app(ImageService::class)->upload($request->file('image'), 'categories');
        }

        $category = Category::create($data);

        return $this->successResponse(new CategoryResource($category), 'Category created', 201);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'parent_id' => ['nullable', 'exists:categories,id', \Illuminate\Validation\Rule::notIn([$category->id]),
                function ($attribute, $value, $fail) use ($category) {
                    if ($value === null) return;
                    $parentId = $value;
                    $visited = [$category->id];
                    while ($parentId) {
                        if (in_array($parentId, $visited)) {
                            $fail('Cannot create circular category hierarchy.');
                            return;
                        }
                        $visited[] = $parentId;
                        $parent = Category::find($parentId);
                        $parentId = $parent?->parent_id;
                    }
                },
            ],
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $data = $request->except('image');
        if ($request->filled('name')) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 2;
            while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $data['slug'] = $slug;
        }

        if ($request->hasFile('image')) {
            if ($category->image) {
                app(ImageService::class)->delete($category->image);
            }
            $data['image'] = app(ImageService::class)->upload($request->file('image'), 'categories');
        }

        $category->update($data);

        return $this->successResponse(new CategoryResource($category->fresh()), 'Category updated');
    }

    public function destroy(Category $category)
    {
        if ($category->products()->count() > 0) {
            return $this->errorResponse('Cannot delete category with products', 422);
        }

        if ($category->image) {
            app(ImageService::class)->delete($category->image);
        }

        $category->children()->update(['parent_id' => null]);
        $category->delete();

        return $this->successResponse(null, 'Category deleted');
    }
}
