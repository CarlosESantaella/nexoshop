<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ExchangeRateService;
use App\Traits\ApiResponse;
use App\Traits\CurrencyConversion;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponse, CurrencyConversion;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
        ]);

        $query = Product::with(['category', 'images', 'approvedReviews'])->active();
        $currency = $this->getRequestedCurrency($request);

        if ($request->filled('category')) {
            $slugs = array_filter(explode(',', $request->category));
            $query->whereHas('category', function ($q) use ($slugs) {
                $q->whereIn('slug', $slugs)
                  ->orWhereHas('parent', fn ($p) => $p->whereIn('slug', $slugs));
            });
        }

        // Convert price filters from user's currency to PEN for DB query
        // Convert price filters from user's currency to USD (base) for DB query
        $toUsd = fn ($v) => app(ExchangeRateService::class)->convert((float) $v, $currency, 'USD');

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $toUsd($request->min_price));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $toUsd($request->max_price));
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->filled('rating')) {
            $minRating = (int) $request->rating;
            $query->whereHas('approvedReviews', function () {})
                  ->withAvg('approvedReviews', 'rating')
                  ->having('approved_reviews_avg_rating', '>=', $minRating);
        }

        $sortBy = $request->input('sort_by', 'newest');
        $query = match ($sortBy) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name' => $query->orderBy('name', 'asc'),
            'rating' => $query->orderByRaw('(SELECT AVG(rating) FROM reviews WHERE reviews.product_id = products.id AND reviews.is_approved = 1) DESC'),
            default => $query->latest(),
        };

        $products = $query->paginate($request->input('per_page', 15));

        return ProductResource::collection($products);
    }

    public function show(Product $product)
    {
        $product->load(['category', 'images', 'approvedReviews.user']);

        return $this->successResponse(new ProductResource($product));
    }

    public function featured()
    {
        $products = Product::with(['category', 'images', 'approvedReviews'])
            ->active()->featured()->latest()->limit(8)->get();

        return $this->successResponse(ProductResource::collection($products));
    }

    public function newArrivals()
    {
        $products = Product::with(['category', 'images', 'approvedReviews'])
            ->active()->latest()->limit(8)->get();

        return $this->successResponse(ProductResource::collection($products));
    }

    public function related(Product $product)
    {
        $related = Product::with(['category', 'images', 'approvedReviews'])
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->inRandomOrder()->limit(4)->get();

        return $this->successResponse(ProductResource::collection($related));
    }
}
