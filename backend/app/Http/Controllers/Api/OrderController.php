<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\CartService;
use App\Services\OrderService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private OrderService $orderService,
        private CartService $cartService,
    ) {}

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'status' => 'nullable|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $orders = $request->user()->orders()
            ->with('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'orders' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'nullable|string|max:2',
            'phone' => 'nullable|string|max:20',
            'coupon_code' => 'nullable|string',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'nullable|string|in:mercadopago,cash_on_delivery',
            'locale' => 'nullable|string|in:es,en',
        ]);

        $cart = $this->cartService->getOrCreateCart($request);
        $cart->load('items');

        $coupon = null;
        if ($request->filled('coupon_code')) {
            $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
            if (!$coupon) {
                return $this->errorResponse('Coupon not found', 404);
            }
            $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
            if (!$coupon->isValid($subtotal)) {
                return $this->errorResponse('Coupon is not valid for this order', 422);
            }
        }

        $currency = strtoupper($request->input('currency', ($request->input('locale', 'en') === 'es') ? 'PEN' : 'USD'));

        try {
            $order = $this->orderService->createOrder(
                $request->user(),
                $cart,
                $request->only([
                    'first_name', 'last_name', 'address_line_1', 'address_line_2',
                    'city', 'state', 'postal_code', 'country', 'phone',
                ]),
                $coupon,
                $request->notes,
                $currency,
                $request->input('payment_method', 'mercadopago'),
            );

            return $this->successResponse($order, 'Order placed successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show(Request $request, string $orderNumber)
    {
        $order = $request->user()->orders()
            ->with('items')
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return $this->successResponse($order);
    }

    public function cancel(Request $request, string $orderNumber)
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        try {
            $order = $this->orderService->cancelOrder($order);
            return $this->successResponse($order, 'Order cancelled');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
