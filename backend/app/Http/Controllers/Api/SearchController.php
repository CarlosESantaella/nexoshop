<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ExchangeRateService;
use App\Traits\ApiResponse;
use App\Traits\CurrencyConversion;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse, CurrencyConversion;

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'per_page' => 'integer|min:1|max:100',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0|gte:min_price',
        ]);

        $query = Product::with(['category', 'images'])->active()->search($request->q);
        $currency = $this->getRequestedCurrency($request);
        $toUsd = fn ($v) => app(ExchangeRateService::class)->convert((float) $v, $currency, 'USD');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $toUsd($request->min_price));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $toUsd($request->max_price));
        }

        $products = $query->paginate($request->input('per_page', 15));

        return ProductResource::collection($products);
    }

    public function autocomplete(Request $request)
    {
        $request->validate(['q' => 'required|string|min:2']);

        $currency = $this->getRequestedCurrency($request);

        $products = Product::active()
            ->search($request->q)
            ->select('id', 'name', 'slug', 'price')
            ->with('images:id,product_id,image_path,is_primary')
            ->limit(5)->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => $this->convertPrice((float) $p->price, $currency),
                'image' => $p->primary_image,
            ]);

        return $this->successResponse($products);
    }
}
