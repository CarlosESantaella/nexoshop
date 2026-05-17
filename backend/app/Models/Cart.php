<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function getTotalAttribute(): float
    {
        if ($this->relationLoaded('items')) {
            return $this->items->sum(fn ($item) => $item->price * $item->quantity);
        }
        return (float) $this->items()->selectRaw('SUM(price * quantity) as total')->value('total') ?? 0;
    }

    public function getItemCountAttribute(): int
    {
        if ($this->relationLoaded('items')) {
            return $this->items->sum('quantity');
        }
        return (int) $this->items()->sum('quantity');
    }
}
