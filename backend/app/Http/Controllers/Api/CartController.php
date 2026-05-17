<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use App\Traits\CurrencyConversion;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse, CurrencyConversion;

    public function __construct(private CartService $cartService) {}

    public function show(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart($request);
        $cart->load('items.product.images');
        $currency = $this->getRequestedCurrency($request);
        $c = fn ($v) => $this->convertPrice((float) $v, $currency);

        $subtotal = (float) $cart->total;
        $shippingCost = $subtotal >= OrderService::FREE_SHIPPING_THRESHOLD ? 0 : OrderService::SHIPPING_COST;

        return $this->successResponse([
            'cart' => $cart,
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $c($item->product->price),
                    'stock' => $item->product->stock,
                    'primary_image' => $item->product->primary_image,
                ],
                'quantity' => $item->quantity,
                'price' => $c($item->price),
                'subtotal' => $c($item->subtotal),
            ]),
            'total' => $c($subtotal),
            'item_count' => $cart->item_count,
            'session_id' => $cart->session_id,
            'shipping_cost' => $c($shippingCost),
            'free_shipping_threshold' => $c(OrderService::FREE_SHIPPING_THRESHOLD),
            'currency' => $currency,
        ]);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => ['required', \Illuminate\Validation\Rule::exists('products', 'id')->whereNull('deleted_at')->where('is_active', true)],
            'quantity' => 'integer|min:1',
        ]);

        $cart = $this->cartService->getOrCreateCart($request);

        try {
            $item = $this->cartService->addItem(
                $cart,
                $request->product_id,
                $request->input('quantity', 1)
            );

            $cart->load('items.product.images');

            $currency = $this->getRequestedCurrency($request);
            return $this->successResponse([
                'item' => $item->load('product.images'),
                'total' => $this->convertPrice((float) $cart->total, $currency),
                'item_count' => $cart->item_count,
                'session_id' => $cart->session_id,
            ], 'Item added to cart');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateItem(Request $request, int $itemId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $cart = $this->cartService->getOrCreateCart($request);
        $item = $cart->items()->findOrFail($itemId);

        try {
            $this->cartService->updateQuantity($item, $request->quantity);
            $cart->load('items.product');

            $currency = $this->getRequestedCurrency($request);
            return $this->successResponse([
                'total' => $this->convertPrice((float) $cart->total, $currency),
                'item_count' => $cart->item_count,
            ], 'Cart updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function removeItem(Request $request, int $itemId)
    {
        $cart = $this->cartService->getOrCreateCart($request);
        $cart->items()->findOrFail($itemId)->delete();
        $cart->load('items.product');

        $currency = $this->getRequestedCurrency($request);
        return $this->successResponse([
            'total' => $this->convertPrice((float) $cart->total, $currency),
            'item_count' => $cart->item_count,
        ], 'Item removed');
    }

    public function clear(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart($request);
        $cart->items()->delete();

        return $this->successResponse(null, 'Cart cleared');
    }

    public function merge(Request $request)
    {
        $request->validate(['session_id' => 'required|string']);

        $headerSessionId = $request->header('X-Session-ID');
        if (!$headerSessionId || $headerSessionId !== $request->session_id) {
            return $this->errorResponse('Invalid session', 403);
        }

        // Verify a real guest cart exists with items before merging
        $guestCart = \App\Models\Cart::where('session_id', $request->session_id)
            ->whereNull('user_id')
            ->first();

        if (!$guestCart || $guestCart->items()->count() === 0) {
            return $this->successResponse(null, 'No cart to merge');
        }

        $this->cartService->mergeGuestCart(
            $request->session_id,
            $request->user()->id
        );

        return $this->successResponse(null, 'Cart merged');
    }
}
