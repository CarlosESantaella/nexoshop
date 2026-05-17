<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

class PaymentController extends Controller
{
    use ApiResponse;

    public function createPreference(Request $request)
    {
        $request->validate(['order_number' => 'required|string']);

        $order = $request->user()->orders()
            ->with('items')
            ->where('order_number', $request->order_number)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        $accessToken = config('services.mercadopago.access_token');
        if (!$accessToken) {
            return $this->errorResponse('Payment service not configured', 503);
        }

        MercadoPagoConfig::setAccessToken($accessToken);

        $client = new PreferenceClient();

        $items = $order->items->map(fn ($item) => [
            'title' => $item->product_name,
            'quantity' => $item->quantity,
            'unit_price' => (float) $item->price,
        ])->toArray();

        try {
            $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
            $isLocal = str_contains($frontendUrl, 'localhost') || str_contains($frontendUrl, '127.0.0.1');

            $preferenceData = [
                'items' => $items,
                'external_reference' => $order->order_number,
            ];

            // MercadoPago rejects localhost URLs for back_urls and notification_url
            if (!$isLocal) {
                $preferenceData['back_urls'] = [
                    'success' => $frontendUrl . '/checkout/confirmation?order=' . $order->order_number,
                    'failure' => $frontendUrl . '/checkout/payment?error=true',
                    'pending' => $frontendUrl . '/checkout/confirmation?order=' . $order->order_number . '&pending=true',
                ];
                $preferenceData['auto_return'] = 'approved';
                $preferenceData['notification_url'] = config('app.url') . '/api/payments/webhook';
            }

            $preference = $client->create($preferenceData);

            $initPoint = app()->environment('local')
                ? $preference->sandbox_init_point
                : $preference->init_point;

            return $this->successResponse([
                'preference_id' => $preference->id,
                'init_point' => $initPoint,
                'sandbox_init_point' => $preference->sandbox_init_point,
            ]);
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            $apiResponse = $e->getApiResponse();
            $detail = $apiResponse ? json_encode($apiResponse->getContent()) : $e->getMessage();
            Log::error('MercadoPago preference error', ['detail' => $detail, 'order' => $order->order_number]);
            return $this->errorResponse('Payment service error: ' . $e->getMessage(), 502);
        }
    }

    public function webhook(Request $request)
    {
        // Validate MercadoPago webhook signature (mandatory)
        $webhookSecret = config('services.mercadopago.webhook_secret');
        if (!$webhookSecret) {
            Log::critical('MercadoPago webhook secret is not configured');
            return response()->json(['error' => 'Payment webhook not configured'], 503);
        }

        $xSignature = $request->header('X-Signature', '');
        $xRequestId = $request->header('X-Request-Id', '');
        $dataId = $request->input('data.id', '');

        $parts = collect(explode(',', $xSignature))->mapWithKeys(function ($part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            return [$key => $value];
        });

        $ts = $parts->get('ts', '');
        $hash = $parts->get('v1', '');

        $manifest = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";
        $expectedHash = hash_hmac('sha256', $manifest, $webhookSecret);

        if (!hash_equals($expectedHash, $hash)) {
            Log::warning('MercadoPago webhook: invalid signature', ['request_id' => $xRequestId]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        if ($request->input('type') === 'payment') {
            $paymentId = $request->input('data.id');

            $accessToken = config('services.mercadopago.access_token');
            if (!$accessToken) return response()->json([], 200);

            MercadoPagoConfig::setAccessToken($accessToken);

            $client = new \MercadoPago\Client\Payment\PaymentClient();
            $payment = $client->get($paymentId);

            if ($payment) {
                DB::transaction(function () use ($payment, $paymentId) {
                    $order = Order::where('order_number', $payment->external_reference)
                        ->lockForUpdate()
                        ->first();

                    if ($order) {
                        // Skip if already processed with this payment ID
                        if ($order->payment_id === (string) $paymentId && $order->payment_status !== 'pending') {
                            return;
                        }

                        // Validate payment amount matches order total
                        if ($payment->status === 'approved' && isset($payment->transaction_amount)) {
                            if (abs((float) $payment->transaction_amount - (float) $order->total) > 0.01) {
                                Log::warning('MercadoPago webhook: payment amount mismatch', [
                                    'order' => $order->order_number,
                                    'expected' => $order->total,
                                    'received' => $payment->transaction_amount,
                                ]);
                                return;
                            }
                        }

                        $status = match ($payment->status) {
                            'approved' => 'paid',
                            'rejected' => 'failed',
                            'refunded' => 'refunded',
                            default => 'pending',
                        };

                        $order->update([
                            'payment_status' => $status,
                            'payment_id' => (string) $paymentId,
                            'status' => $status === 'paid' ? 'processing' : $order->status,
                        ]);
                    }
                });
            }
        }

        return response()->json([], 200);
    }
}
