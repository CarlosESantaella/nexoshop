<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General
            ['group' => 'general', 'key' => 'store_name', 'value' => 'NexoShop', 'type' => 'string'],
            ['group' => 'general', 'key' => 'store_email', 'value' => 'info@nexoshop.com', 'type' => 'string'],
            ['group' => 'general', 'key' => 'store_phone', 'value' => '+51 999 999 999', 'type' => 'string'],
            ['group' => 'general', 'key' => 'store_address', 'value' => 'Lima, Perú', 'type' => 'string'],
            ['group' => 'general', 'key' => 'store_currency', 'value' => 'USD', 'type' => 'string'],
            ['group' => 'general', 'key' => 'store_description', 'value' => 'Tu tienda online de confianza', 'type' => 'string'],

            // Shipping
            ['group' => 'shipping', 'key' => 'free_shipping_threshold', 'value' => '150', 'type' => 'decimal'],
            ['group' => 'shipping', 'key' => 'default_shipping_cost', 'value' => '15', 'type' => 'decimal'],
            ['group' => 'shipping', 'key' => 'shipping_origin_country', 'value' => 'PE', 'type' => 'string'],
            ['group' => 'shipping', 'key' => 'shipping_origin_city', 'value' => 'Lima', 'type' => 'string'],

            // Tax
            ['group' => 'tax', 'key' => 'tax_enabled', 'value' => '0', 'type' => 'boolean'],
            ['group' => 'tax', 'key' => 'tax_rate', 'value' => '18', 'type' => 'decimal'],
            ['group' => 'tax', 'key' => 'tax_name', 'value' => 'IGV', 'type' => 'string'],
            ['group' => 'tax', 'key' => 'prices_include_tax', 'value' => '1', 'type' => 'boolean'],

            // Email
            ['group' => 'email', 'key' => 'email_from_name', 'value' => 'NexoShop', 'type' => 'string'],
            ['group' => 'email', 'key' => 'email_from_address', 'value' => 'noreply@nexoshop.com', 'type' => 'string'],
            ['group' => 'email', 'key' => 'email_order_confirmation', 'value' => '1', 'type' => 'boolean'],
            ['group' => 'email', 'key' => 'email_shipping_notification', 'value' => '1', 'type' => 'boolean'],

            // Social
            ['group' => 'social', 'key' => 'social_facebook', 'value' => '', 'type' => 'string'],
            ['group' => 'social', 'key' => 'social_instagram', 'value' => '', 'type' => 'string'],
            ['group' => 'social', 'key' => 'social_twitter', 'value' => '', 'type' => 'string'],
            ['group' => 'social', 'key' => 'social_whatsapp', 'value' => '', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
