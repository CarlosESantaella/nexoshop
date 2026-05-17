<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'integer|min:1|max:100',
        ]);

        return $this->successResponse(Coupon::latest()->paginate($request->input('per_page', 15)));
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:coupons|max:50',
            'type' => 'required|in:fixed,percentage',
            'value' => ['required', 'numeric', 'min:0', function ($attribute, $value, $fail) use ($request) {
                if ($request->type === 'percentage' && $value > 100) {
                    $fail('Percentage discount cannot exceed 100.');
                }
            }],
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['code'] = strtoupper($data['code']);

        $coupon = Coupon::create($data);
        return $this->successResponse($coupon, 'Coupon created', 201);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $type = $request->input('type', $coupon->type);
        $request->validate([
            'code' => 'sometimes|string|unique:coupons,code,' . $coupon->id . '|max:50',
            'type' => 'sometimes|in:fixed,percentage',
            'value' => ['sometimes', 'numeric', 'min:0', function ($attribute, $value, $fail) use ($type) {
                if ($type === 'percentage' && $value > 100) {
                    $fail('Percentage discount cannot exceed 100.');
                }
            }],
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $data = $request->only('code', 'type', 'value', 'min_order_amount', 'max_uses', 'starts_at', 'expires_at', 'is_active');
        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);
        return $this->successResponse($coupon->fresh(), 'Coupon updated');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return $this->successResponse(null, 'Coupon deleted');
    }
}
