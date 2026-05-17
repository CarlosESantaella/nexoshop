<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SettingService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    use ApiResponse;

    public function __construct(private SettingService $settingService) {}

    public function index()
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get()
            ->groupBy('group')
            ->map(fn ($group) => $group->mapWithKeys(fn ($s) => [$s->key => ['value' => $s->casted_value, 'type' => $s->type]]));

        return $this->successResponse($settings);
    }

    public function getByGroup(string $group)
    {
        $settings = Setting::where('group', $group)->get()
            ->mapWithKeys(fn ($s) => [$s->key => ['value' => $s->casted_value, 'type' => $s->type]]);

        return $this->successResponse($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'present',
        ]);

        $this->settingService->bulkUpdate($request->settings);

        return $this->successResponse(null, 'Settings updated');
    }

    public function publicSettings()
    {
        $publicKeys = [
            'store_name', 'store_email', 'store_phone', 'store_address',
            'store_currency', 'tax_rate', 'free_shipping_threshold',
            'default_shipping_cost', 'social_facebook', 'social_instagram', 'social_twitter',
        ];

        $settings = Setting::whereIn('key', $publicKeys)->get()
            ->mapWithKeys(fn ($s) => [$s->key => $s->casted_value]);

        return response()->json(['success' => true, 'data' => $settings]);
    }
}
