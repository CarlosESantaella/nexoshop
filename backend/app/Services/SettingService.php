<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class SettingService
{
    private const CACHE_KEY = 'app_settings';
    private const CACHE_TTL = 3600;

    public function get(string $key, mixed $default = null): mixed
    {
        $settings = $this->all();

        return $settings[$key] ?? $default;
    }

    public function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): void
    {
        Setting::updateOrCreate(
            ['key' => $key],
            ['value' => is_array($value) ? json_encode($value) : (string) $value, 'group' => $group, 'type' => $type]
        );

        $this->clearCache();
    }

    public function getGroup(string $group): array
    {
        $settings = $this->all();
        $result = [];

        foreach (Setting::where('group', $group)->pluck('key')->toArray() as $key) {
            $result[$key] = $settings[$key] ?? null;
        }

        return $result;
    }

    public function all(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Setting::all()->pluck('casted_value', 'key')->toArray();
        });
    }

    public function bulkUpdate(array $settings): void
    {
        foreach ($settings as $item) {
            Setting::where('key', $item['key'])->update(['value' => $item['value']]);
        }

        $this->clearCache();
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
