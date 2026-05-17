<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => null,
            'max_uses' => null,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addYear(),
        ]);

        Coupon::create([
            'code' => 'SAVE20',
            'type' => 'fixed',
            'value' => 20,
            'min_order_amount' => 50,
            'max_uses' => 500,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
        ]);

        Coupon::create([
            'code' => 'SUMMER25',
            'type' => 'percentage',
            'value' => 25,
            'min_order_amount' => 100,
            'max_uses' => 200,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
        ]);
    }
}
