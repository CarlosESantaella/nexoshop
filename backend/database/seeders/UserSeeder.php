<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin NexoShop',
            'email' => 'admin@nexoshop.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $customers = [
            ['name' => 'María García', 'email' => 'maria@example.com'],
            ['name' => 'Carlos López', 'email' => 'carlos@example.com'],
            ['name' => 'Ana Martínez', 'email' => 'ana@example.com'],
            ['name' => 'Pedro Rodríguez', 'email' => 'pedro@example.com'],
            ['name' => 'Laura Fernández', 'email' => 'laura@example.com'],
            ['name' => 'Diego Sánchez', 'email' => 'diego@example.com'],
            ['name' => 'Sofia Torres', 'email' => 'sofia@example.com'],
            ['name' => 'Miguel Herrera', 'email' => 'miguel@example.com'],
            ['name' => 'Valentina Ruiz', 'email' => 'valentina@example.com'],
            ['name' => 'Andrés Morales', 'email' => 'andres@example.com'],
        ];

        foreach ($customers as $customer) {
            User::create([
                'name' => $customer['name'],
                'email' => $customer['email'],
                'password' => Hash::make('password'),
                'role' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
