<?php

namespace App\Http\Resources;

use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currency = strtoupper($request->input('currency', 'PEN'));
        $exchange = app(ExchangeRateService::class);
        $convert = fn (float $amount) => $exchange->convert($amount, 'USD', $currency);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => $convert((float) $this->price),
            'compare_price' => $this->compare_price ? $convert((float) $this->compare_price) : null,
            'discount_percent' => $this->discount_percent,
            'is_on_sale' => $this->is_on_sale,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'weight' => $this->weight,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'primary_image' => $this->primary_image,
            'average_rating' => $this->average_rating,
            'review_count' => $this->review_count,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'reviews' => ReviewResource::collection($this->whenLoaded('approvedReviews')),
            'created_at' => $this->created_at,
        ];
    }
}
