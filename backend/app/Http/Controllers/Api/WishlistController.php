<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Wishlist;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $wishlistItems = Wishlist::with('product.images', 'product.category')
            ->where('user_id', $request->user()->id)
            ->latest()->get();

        $products = $wishlistItems->map(fn ($item) => new ProductResource($item->product));

        return $this->successResponse($products);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => ['required', \Illuminate\Validation\Rule::exists('products', 'id')->whereNull('deleted_at')->where('is_active', true)],
        ]);

        $existing = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)->first();

        if ($existing) {
            $existing->delete();
            return $this->successResponse(['action' => 'removed'], 'Removed from wishlist');
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return $this->successResponse(['action' => 'added'], 'Added to wishlist', 201);
    }

    public function check(Request $request)
    {
        $productIds = Wishlist::where('user_id', $request->user()->id)
            ->pluck('product_id');

        return $this->successResponse($productIds);
    }
}
