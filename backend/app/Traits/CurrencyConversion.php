<?php

namespace App\Traits;

use App\Services\ExchangeRateService;
use Illuminate\Http\Request;

trait CurrencyConversion
{
    protected function getRequestedCurrency(Request $request): string
    {
        $currency = strtoupper($request->input('currency', 'PEN'));

        return in_array($currency, ['PEN', 'USD']) ? $currency : 'PEN';
    }

    protected function convertPrice(float $amount, string $targetCurrency): float
    {
        return app(ExchangeRateService::class)->convert($amount, 'USD', $targetCurrency);
    }
}
