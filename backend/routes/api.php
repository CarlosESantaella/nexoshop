<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => 'NexoShop API']));

// Exchange rate
Route::get('/exchange-rate', function () {
    $rate = app(\App\Services\ExchangeRateService::class)->getRate('PEN', 'USD');
    return response()->json(['PEN_to_USD' => $rate, 'USD_to_PEN' => round(1 / $rate, 4)]);
});

// ─── Public Routes ───────────────────────────────────────────────
// Auth
Route::prefix('auth')->middleware('throttle:30,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Products, Categories & Reviews (public browsing)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
    Route::get('/products/{product:slug}', [ProductController::class, 'show']);
    Route::get('/products/{product:slug}/related', [ProductController::class, 'related']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category:slug}', [CategoryController::class, 'show']);

    Route::get('/products/{product:slug}/reviews', [ReviewController::class, 'index']);
});

// Cart (works with session or auth)
Route::prefix('cart')->middleware('throttle:30,1')->group(function () {
    Route::get('/', [CartController::class, 'show']);
    Route::post('/items', [CartController::class, 'addItem']);
    Route::put('/items/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/items/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('/', [CartController::class, 'clear']);
});

// Search
Route::middleware('throttle:30,1')->group(function () {
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/autocomplete', [SearchController::class, 'autocomplete']);
});

// Coupon validation
Route::post('/coupons/validate', [CouponController::class, 'validateCoupon'])->middleware('throttle:10,1');

// Payment webhook (no auth needed)
Route::post('/payments/webhook', [PaymentController::class, 'webhook'])->middleware('throttle:10,1');

// ─── Authenticated Routes ────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // Cart merge
    Route::post('/cart/merge', [CartController::class, 'merge']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist/check', [WishlistController::class, 'check']);

    // Addresses
    Route::apiResource('addresses', AddressController::class);
    Route::patch('/addresses/{address}/default', [AddressController::class, 'setDefault']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
    Route::patch('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);

    // Reviews (write)
    Route::post('/products/{product:slug}/reviews', [ReviewController::class, 'store']);

    // Payments
    Route::post('/payments/create-preference', [PaymentController::class, 'createPreference']);
});

// ─── Admin Routes ────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/stats', [AdminOrderController::class, 'stats']);

    // Products (explicit routes to bind {product} by id, not slug)
    Route::get('products', [AdminProductController::class, 'index']);
    Route::post('products', [AdminProductController::class, 'store']);
    Route::get('products/{product}', [AdminProductController::class, 'show'])->where('product', '[0-9]+');
    Route::put('products/{product}', [AdminProductController::class, 'update'])->where('product', '[0-9]+');
    Route::delete('products/{product}', [AdminProductController::class, 'destroy'])->where('product', '[0-9]+');
    Route::patch('/products/{product}/toggle-featured', [AdminProductController::class, 'toggleFeatured'])->where('product', '[0-9]+');
    Route::patch('/products/{product}/toggle-active', [AdminProductController::class, 'toggleActive'])->where('product', '[0-9]+');
    Route::post('/products/{product}/images', [AdminProductController::class, 'uploadImages'])->where('product', '[0-9]+');
    Route::delete('/products/{product}/images/{image}', [AdminProductController::class, 'deleteImage'])->where('product', '[0-9]+');
    Route::patch('/products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage'])->where('product', '[0-9]+');

    // Categories
    Route::apiResource('categories', AdminCategoryController::class)->except('show');

    // Orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

    // Users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);

    // Coupons
    Route::apiResource('coupons', AdminCouponController::class)->except('show');

    // Reviews
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::patch('/reviews/{review}/approve', [AdminReviewController::class, 'approve']);
    Route::patch('/reviews/{review}/reject', [AdminReviewController::class, 'reject']);

    // Settings
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/settings/{group}', [SettingController::class, 'getByGroup']);
    Route::put('/settings', [SettingController::class, 'update']);
});

// Public settings (no auth)
Route::get('/settings/public', [SettingController::class, 'publicSettings']);
