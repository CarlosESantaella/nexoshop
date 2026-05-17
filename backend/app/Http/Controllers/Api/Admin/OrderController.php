<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    private const VALID_TRANSITIONS = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function __construct(private \App\Services\OrderService $orderService) {}

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
            'status' => 'nullable|in:pending,processing,shipped,delivered,cancelled',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
        ]);

        $query = Order::with(['user:id,name,email', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        $orders = $query->latest()->paginate($request->input('per_page', 15));

        return $this->successResponse([
            'orders' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order)
    {
        return $this->successResponse($order->load(['user', 'items', 'coupon']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $allowed = self::VALID_TRANSITIONS[$order->status] ?? [];
        if (!in_array($request->status, $allowed)) {
            return $this->errorResponse(
                "Cannot change status from '{$order->status}' to '{$request->status}'",
                422
            );
        }

        if ($request->status === 'cancelled') {
            try {
                $order = $this->orderService->cancelOrder($order);
                return $this->successResponse($order, 'Order cancelled and stock restored');
            } catch (\Exception $e) {
                return $this->errorResponse($e->getMessage(), 422);
            }
        }

        $order->update(['status' => $request->status]);

        return $this->successResponse($order->fresh(), 'Order status updated');
    }

    public function stats()
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $monthRevenue = Order::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)->sum('total');
        $todayRevenue = Order::where('payment_status', 'paid')
            ->whereDate('created_at', today())->sum('total');

        $totalOrders = Order::count();
        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        $totalCustomers = \App\Models\User::where('role', 'customer')->count();
        $totalProducts = \App\Models\Product::count();

        $recentOrders = Order::with('user:id,name')
            ->latest()->limit(10)->get(['id', 'order_number', 'user_id', 'status', 'total', 'created_at']);

        $lowStock = \App\Models\Product::whereNotNull('low_stock_threshold')
            ->whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('is_active', true)
            ->select('id', 'name', 'slug', 'stock', 'low_stock_threshold')
            ->limit(10)->get();

        $topProducts = \App\Models\OrderItem::selectRaw('product_name, SUM(quantity) as total_sold, SUM(total) as total_revenue')
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->limit(5)->get();

        // Revenue chart (last 30 days)
        $revenueChart = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->successResponse([
            'revenue' => [
                'total' => (float) $totalRevenue,
                'this_month' => (float) $monthRevenue,
                'today' => (float) $todayRevenue,
            ],
            'orders' => [
                'total' => $totalOrders,
                'by_status' => $ordersByStatus,
            ],
            'customers' => $totalCustomers,
            'products' => $totalProducts,
            'recent_orders' => $recentOrders,
            'low_stock' => $lowStock,
            'top_products' => $topProducts,
            'revenue_chart' => $revenueChart,
        ]);
    }
}
