<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Services\ExchangeRateService;
use App\Traits\ApiResponse;
use App\Traits\CurrencyConversion;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse, CurrencyConversion;

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $currency = $this->getRequestedCurrency($request);
        $exchange = app(ExchangeRateService::class);

        // Convert subtotal to PEN for validation (DB values are in PEN)
        $subtotalPen = $exchange->convert((float) $request->subtotal, $currency, 'USD');

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return $this->errorResponse('Coupon not found', 404);
        }

        if (!$coupon->isValid($subtotalPen)) {
            return $this->errorResponse('Coupon is not valid for this order', 422);
        }

        $discountPen = $coupon->calculateDiscount($subtotalPen);
        $convert = fn ($v) => $exchange->convert($v, 'USD', $currency);

        return $this->successResponse([
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'value' => (float) $coupon->value,
            ],
            'discount' => $convert($discountPen),
            'new_total' => $convert($subtotalPen - $discountPen),
        ]);
    }
}
