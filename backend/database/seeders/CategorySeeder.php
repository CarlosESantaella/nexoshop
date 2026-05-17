<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electrónica',
                'description' => 'Últimos gadgets, dispositivos y accesorios tecnológicos',
                'children' => ['Smartphones', 'Laptops', 'Audio', 'Accesorios'],
            ],
            [
                'name' => 'Ropa',
                'description' => 'Moda para hombres, mujeres y niños',
                'children' => ['Hombre', 'Mujer', 'Niños'],
            ],
            [
                'name' => 'Hogar y Jardín',
                'description' => 'Todo para tu hogar y jardín',
                'children' => ['Muebles', 'Decoración', 'Cocina'],
            ],
            [
                'name' => 'Deportes',
                'description' => 'Equipamiento deportivo y ropa deportiva',
                'children' => ['Fitness', 'Outdoor', 'Deportes en Equipo'],
            ],
            [
                'name' => 'Libros',
                'description' => 'Libros, ebooks y audiolibros',
                'children' => ['Ficción', 'No Ficción', 'Académico'],
            ],
            [
                'name' => 'Belleza',
                'description' => 'Cuidado de la piel, maquillaje y cuidado personal',
                'children' => ['Cuidado de Piel', 'Maquillaje', 'Fragancias'],
            ],
            [
                'name' => 'Juguetes',
                'description' => 'Juguetes y juegos para todas las edades',
                'children' => ['Educativos', 'Figuras de Acción', 'Juegos de Mesa'],
            ],
            [
                'name' => 'Automotriz',
                'description' => 'Repuestos, herramientas y accesorios para autos',
                'children' => ['Repuestos', 'Herramientas', 'Accesorios'],
            ],
        ];

        $sortOrder = 0;
        foreach ($categories as $cat) {
            $parent = Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
                'is_active' => true,
                'sort_order' => $sortOrder++,
            ]);

            $childOrder = 0;
            foreach ($cat['children'] as $childName) {
                Category::create([
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'slug' => Str::slug($cat['name'] . '-' . $childName),
                    'is_active' => true,
                    'sort_order' => $childOrder++,
                ]);
            }
        }
    }
}
