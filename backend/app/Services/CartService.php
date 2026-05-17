<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function getOrCreateCart(Request $request): Cart
    {
        if ($request->user()) {
            $userCart = Cart::firstOrCreate(
                ['user_id' => $request->user()->id],
                ['session_id' => null]
            );

            // Auto-merge guest cart if session header is present and user cart is empty
            $sessionId = $request->header('X-Session-ID');
            if ($sessionId && $userCart->items()->count() === 0) {
                $guestCart = Cart::where('session_id', $sessionId)->whereNull('user_id')->first();
                if ($guestCart && $guestCart->items()->count() > 0) {
                    $this->mergeGuestCart($sessionId, $request->user()->id);
                    $userCart->refresh();
                }
            }

            return $userCart;
        }

        $sessionId = $request->header('X-Session-ID');
        if (!$sessionId) {
            $sessionId = bin2hex(random_bytes(20));
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function addItem(Cart $cart, int $productId, int $quantity = 1): CartItem
    {
        $product = Product::findOrFail($productId);

        if (!$product->is_active) {
            throw new \Exception('Product is not available');
        }

        $existing = $cart->items()->where('product_id', $productId)->first();

        if ($existing) {
            $newQty = $existing->quantity + $quantity;
            if ($newQty > $product->stock) {
                throw new \Exception('Not enough stock available');
            }
            $existing->update(['quantity' => $newQty, 'price' => $product->price]);
            return $existing->fresh();
        }

        if ($quantity > $product->stock) {
            throw new \Exception('Not enough stock available');
        }

        return $cart->items()->create([
            'product_id' => $productId,
            'quantity' => $quantity,
            'price' => $product->price,
        ]);
    }

    public function updateQuantity(CartItem $item, int $quantity): CartItem
    {
        $product = $item->product;
        if ($quantity > $product->stock) {
            throw new \Exception('Not enough stock available');
        }

        $item->update(['quantity' => $quantity]);
        return $item->fresh();
    }

    public function mergeGuestCart(string $sessionId, int $userId): void
    {
        DB::transaction(function () use ($sessionId, $userId) {
            $guestCart = Cart::where('session_id', $sessionId)->lockForUpdate()->first();
            if (!$guestCart) return;

            $userCart = Cart::firstOrCreate(['user_id' => $userId]);

            foreach ($guestCart->items()->with('product')->get() as $guestItem) {
                if (!$guestItem->product || !$guestItem->product->is_active) {
                    continue; // Skip unavailable products
                }

                $currentPrice = $guestItem->product->price;
                $existing = $userCart->items()->where('product_id', $guestItem->product_id)->first();
                if ($existing) {
                    $existing->update([
                        'quantity' => min($existing->quantity + $guestItem->quantity, $guestItem->product->stock),
                        'price' => $currentPrice,
                    ]);
                } else {
                    $userCart->items()->create([
                        'product_id' => $guestItem->product_id,
                        'quantity' => min($guestItem->quantity, $guestItem->product->stock),
                        'price' => $currentPrice,
                    ]);
                }
            }

            $guestCart->items()->delete();
            $guestCart->delete();
        });
    }
}
