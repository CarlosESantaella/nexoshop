<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    private const CACHE_KEY = 'exchange_rate_usd_pen';

    public function getRate(string $from, string $to): float
    {
        if ($from === $to) return 1.0;

        $rate = Cache::remember(
            self::CACHE_KEY,
            config('services.exchange_rate.cache_ttl', 3600),
            fn () => $this->fetchRateFromApis()
        );

        // $rate = USD→PEN (e.g., 3.38)
        if ($from === 'USD' && $to === 'PEN') return $rate;
        if ($from === 'PEN' && $to === 'USD') return round(1 / $rate, 6);

        return 1.0;
    }

    public function convert(float $amount, string $from, string $to): float
    {
        if ($from === $to) return $amount;

        return round($amount * $this->getRate($from, $to), 2);
    }

    private function fetchRateFromApis(): float
    {
        $apis = [
            fn () => $this->fetchFromOpenErApi(),
            fn () => $this->fetchFromFawazApi(),
            fn () => $this->fetchFromExchangeRateApi(),
        ];

        foreach ($apis as $index => $apiFn) {
            try {
                $rate = $apiFn();
                if ($rate > 0) {
                    Log::info("Exchange rate fetched from API #" . ($index + 1) . ": USD→PEN = {$rate}");
                    return $rate;
                }
            } catch (\Throwable $e) {
                Log::warning("Exchange rate API #" . ($index + 1) . " failed: " . $e->getMessage());
            }
        }

        $fallback = config('services.exchange_rate.fallback_usd_pen', 3.70);
        Log::error("All exchange rate APIs failed. Using fallback rate: {$fallback}");

        return $fallback;
    }

    private function fetchFromOpenErApi(): float
    {
        $response = Http::timeout(5)->get('https://open.er-api.com/v6/latest/USD');
        $data = $response->json();

        return (float) $data['rates']['PEN'];
    }

    private function fetchFromFawazApi(): float
    {
        $response = Http::timeout(5)->get('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        $data = $response->json();

        return (float) $data['usd']['pen'];
    }

    private function fetchFromExchangeRateApi(): float
    {
        $response = Http::timeout(5)->get('https://api.exchangerate-api.com/v4/latest/USD');
        $data = $response->json();

        return (float) $data['rates']['PEN'];
    }
}
