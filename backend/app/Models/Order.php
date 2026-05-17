<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'order_number', 'status', 'subtotal', 'discount_amount',
        'shipping_cost', 'tax_amount', 'total', 'coupon_id', 'payment_method',
        'payment_status', 'payment_id', 'currency',
        'shipping_first_name', 'shipping_last_name', 'shipping_address_line_1',
        'shipping_address_line_2', 'shipping_city', 'shipping_state',
        'shipping_postal_code', 'shipping_country', 'shipping_phone', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Generate order number. Must be called inside a DB::transaction().
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->lockForUpdate()
            ->latest('id')
            ->first();
        $sequence = $lastOrder ? ((int) substr($lastOrder->order_number, -4)) + 1 : 1;
        return 'NXS-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
