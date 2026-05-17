<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public const FREE_SHIPPING_THRESHOLD = 150;
    public const SHIPPING_COST = 15;

    public function __construct(private ExchangeRateService $exchangeRateService) {}

    public function createOrder(User $user, Cart $cart, array $shippingData, ?Coupon $coupon = null, ?string $notes = null, string $currency = 'USD', string $paymentMethod = 'mercadopago'): Order
    {
        return DB::transaction(function () use ($user, $cart, $shippingData, $coupon, $notes, $currency, $paymentMethod) {
            $convert = fn (float $amount) => $this->exchangeRateService->convert($amount, 'USD', $currency);
            $cart->load('items.product');

            if ($cart->items->isEmpty()) {
                throw new \Exception('Cart is empty');
            }

            // Lock products and validate stock + active status
            foreach ($cart->items as $item) {
                $product = \App\Models\Product::where('id', $item->product_id)->lockForUpdate()->first();
                if (!$product || !$product->is_active) {
                    throw new \Exception("Product is no longer available: {$item->product->name}");
                }
                if ($product->stock < $item->quantity) {
                    throw new \Exception("Insufficient stock for: {$product->name}");
                }
                $item->setRelation('product', $product);
            }

            $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
            $discountAmount = 0;

            if ($coupon) {
                $coupon = \App\Models\Coupon::where('id', $coupon->id)->lockForUpdate()->first();
                if ($coupon && $coupon->isValid($subtotal)) {
                    $discountAmount = $coupon->calculateDiscount($subtotal);
                    $coupon->increment('used_count');
                } else {
                    $coupon = null; // Don't associate invalid coupon with order
                }
            }

            // Shipping threshold evaluated in PEN (business rule)
            $shippingCost = $subtotal >= self::FREE_SHIPPING_THRESHOLD ? 0 : self::SHIPPING_COST;
            $taxAmount = 0;
            $total = $subtotal - $discountAmount + $shippingCost + $taxAmount;

            $orderNumber = Order::generateOrderNumber();

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'subtotal' => $convert($subtotal),
                'discount_amount' => $convert($discountAmount),
                'shipping_cost' => $convert($shippingCost),
                'tax_amount' => $convert($taxAmount),
                'total' => $convert($total),
                'coupon_id' => $coupon?->id,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'currency' => $currency,
                'shipping_first_name' => $shippingData['first_name'],
                'shipping_last_name' => $shippingData['last_name'],
                'shipping_address_line_1' => $shippingData['address_line_1'],
                'shipping_address_line_2' => $shippingData['address_line_2'] ?? null,
                'shipping_city' => $shippingData['city'],
                'shipping_state' => $shippingData['state'],
                'shipping_postal_code' => $shippingData['postal_code'],
                'shipping_country' => $shippingData['country'] ?? 'PE',
                'shipping_phone' => $shippingData['phone'] ?? null,
                'notes' => $notes,
            ]);

            // Create order items and decrement stock
            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_image' => $item->product->primary_image,
                    'quantity' => $item->quantity,
                    'price' => $convert($item->price),
                    'total' => $convert($item->price * $item->quantity),
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            // Clear cart
            $cart->items()->delete();

            return $order->load('items');
        });
    }

    public function cancelOrder(Order $order): Order
    {
        if ($order->status !== 'pending') {
            throw new \Exception('Only pending orders can be cancelled');
        }

        return DB::transaction(function () use ($order) {
            // Restore stock
            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                }
            }

            // Restore coupon usage (prevent going below 0)
            if ($order->coupon && $order->coupon->used_count > 0) {
                $order->coupon->decrement('used_count');
            }

            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'failed',
            ]);

            return $order->fresh();
        });
    }
}
