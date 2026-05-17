<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Electrónica > Smartphones
            ['cat' => 'electronica-smartphones', 'name' => 'iPhone 15 Pro Max', 'price' => 1199.99, 'compare' => 1299.99, 'stock' => 25, 'desc' => 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.', 'featured' => true],
            ['cat' => 'electronica-smartphones', 'name' => 'Samsung Galaxy S24 Ultra', 'price' => 1099.99, 'compare' => null, 'stock' => 30, 'desc' => 'Galaxy AI-powered smartphone with S Pen, titanium frame, and 200MP camera.', 'featured' => true],
            ['cat' => 'electronica-smartphones', 'name' => 'Google Pixel 8 Pro', 'price' => 899.99, 'compare' => 999.99, 'stock' => 20, 'desc' => 'Pure Android experience with Google Tensor G3 chip and AI-powered camera features.'],
            ['cat' => 'electronica-smartphones', 'name' => 'OnePlus 12', 'price' => 699.99, 'compare' => null, 'stock' => 15, 'desc' => 'Flagship performance with Snapdragon 8 Gen 3 and Hasselblad cameras.'],

            // Electrónica > Laptops
            ['cat' => 'electronica-laptops', 'name' => 'MacBook Pro 16" M3 Max', 'price' => 2499.99, 'compare' => null, 'stock' => 10, 'desc' => 'The ultimate pro laptop with M3 Max chip, Liquid Retina XDR display.', 'featured' => true],
            ['cat' => 'electronica-laptops', 'name' => 'Dell XPS 15', 'price' => 1599.99, 'compare' => 1799.99, 'stock' => 12, 'desc' => 'Premium ultrabook with InfinityEdge display and 13th Gen Intel Core.'],
            ['cat' => 'electronica-laptops', 'name' => 'ASUS ROG Zephyrus G16', 'price' => 1899.99, 'compare' => null, 'stock' => 8, 'desc' => 'Gaming laptop with RTX 4070 and 240Hz OLED display.'],

            // Electrónica > Audio
            ['cat' => 'electronica-audio', 'name' => 'Sony WH-1000XM5', 'price' => 349.99, 'compare' => 399.99, 'stock' => 40, 'desc' => 'Industry-leading noise canceling wireless headphones with exceptional sound.', 'featured' => true],
            ['cat' => 'electronica-audio', 'name' => 'AirPods Pro 2', 'price' => 249.99, 'compare' => null, 'stock' => 50, 'desc' => 'Active noise cancellation, adaptive audio, and personalized spatial audio.'],
            ['cat' => 'electronica-audio', 'name' => 'JBL Charge 5', 'price' => 179.99, 'compare' => 199.99, 'stock' => 35, 'desc' => 'Portable Bluetooth speaker with powerful sound and built-in powerbank.'],

            // Electrónica > Accesorios
            ['cat' => 'electronica-accesorios', 'name' => 'Apple Watch Series 9', 'price' => 399.99, 'compare' => null, 'stock' => 20, 'desc' => 'Advanced health monitoring with Double Tap gesture.'],
            ['cat' => 'electronica-accesorios', 'name' => 'Logitech MX Master 3S', 'price' => 99.99, 'compare' => null, 'stock' => 60, 'desc' => 'Advanced wireless mouse with MagSpeed scroll and ergonomic design.'],

            // Ropa > Hombre
            ['cat' => 'ropa-hombre', 'name' => 'Classic Fit Oxford Shirt', 'price' => 59.99, 'compare' => 79.99, 'stock' => 100, 'desc' => 'Premium cotton Oxford shirt with button-down collar. Timeless style.'],
            ['cat' => 'ropa-hombre', 'name' => 'Slim Fit Chino Pants', 'price' => 49.99, 'compare' => null, 'stock' => 80, 'desc' => 'Versatile cotton chinos with a modern slim fit.'],
            ['cat' => 'ropa-hombre', 'name' => 'Premium Leather Jacket', 'price' => 299.99, 'compare' => 399.99, 'stock' => 15, 'desc' => 'Genuine leather biker jacket with quilted lining.', 'featured' => true],
            ['cat' => 'ropa-hombre', 'name' => 'Running Sneakers Pro', 'price' => 129.99, 'compare' => null, 'stock' => 45, 'desc' => 'Lightweight running shoes with responsive cushioning.'],

            // Ropa > Mujer
            ['cat' => 'ropa-mujer', 'name' => 'Floral Maxi Dress', 'price' => 89.99, 'compare' => 119.99, 'stock' => 40, 'desc' => 'Elegant floral print maxi dress perfect for any occasion.'],
            ['cat' => 'ropa-mujer', 'name' => 'High-Waist Yoga Pants', 'price' => 54.99, 'compare' => null, 'stock' => 70, 'desc' => 'Buttery soft yoga pants with high-waist support.'],
            ['cat' => 'ropa-mujer', 'name' => 'Cashmere Sweater', 'price' => 149.99, 'compare' => 199.99, 'stock' => 25, 'desc' => '100% cashmere pullover with ribbed details.', 'featured' => true],

            // Ropa > Niños
            ['cat' => 'ropa-ninos', 'name' => 'Dinosaur Print T-Shirt', 'price' => 19.99, 'compare' => null, 'stock' => 120, 'desc' => 'Fun dinosaur print cotton t-shirt for kids.'],
            ['cat' => 'ropa-ninos', 'name' => 'Waterproof Rain Jacket', 'price' => 44.99, 'compare' => 59.99, 'stock' => 50, 'desc' => 'Colorful waterproof jacket with reflective details.'],

            // Hogar y Jardín > Muebles
            ['cat' => 'hogar-y-jardin-muebles', 'name' => 'Modern Sectional Sofa', 'price' => 1299.99, 'compare' => 1599.99, 'stock' => 5, 'desc' => 'L-shaped sectional with premium fabric and solid wood legs.'],
            ['cat' => 'hogar-y-jardin-muebles', 'name' => 'Ergonomic Office Chair', 'price' => 449.99, 'compare' => 549.99, 'stock' => 18, 'desc' => 'Adjustable lumbar support, breathable mesh, and armrests.', 'featured' => true],
            ['cat' => 'hogar-y-jardin-muebles', 'name' => 'Standing Desk Electric', 'price' => 599.99, 'compare' => null, 'stock' => 12, 'desc' => 'Electric height-adjustable standing desk with memory presets.'],

            // Hogar y Jardín > Decoración
            ['cat' => 'hogar-y-jardin-decoracion', 'name' => 'Abstract Canvas Art Set', 'price' => 89.99, 'compare' => null, 'stock' => 30, 'desc' => 'Set of 3 abstract canvas prints in modern blue and gold tones.'],
            ['cat' => 'hogar-y-jardin-decoracion', 'name' => 'LED Floor Lamp', 'price' => 129.99, 'compare' => 159.99, 'stock' => 22, 'desc' => 'Modern arc floor lamp with dimmable LED and remote control.'],

            // Hogar y Jardín > Cocina
            ['cat' => 'hogar-y-jardin-cocina', 'name' => 'Professional Knife Set', 'price' => 199.99, 'compare' => 249.99, 'stock' => 25, 'desc' => '15-piece German steel knife set with wooden block.'],
            ['cat' => 'hogar-y-jardin-cocina', 'name' => 'Smart Coffee Maker', 'price' => 179.99, 'compare' => null, 'stock' => 35, 'desc' => 'WiFi-enabled coffee maker with programmable brewing and app control.'],

            // Deportes > Fitness
            ['cat' => 'deportes-fitness', 'name' => 'Adjustable Dumbbell Set', 'price' => 349.99, 'compare' => 449.99, 'stock' => 20, 'desc' => 'Adjustable dumbbells from 5-52.5 lbs with quick-change system.'],
            ['cat' => 'deportes-fitness', 'name' => 'Yoga Mat Premium', 'price' => 69.99, 'compare' => null, 'stock' => 60, 'desc' => 'Non-slip natural rubber yoga mat with alignment lines.'],
            ['cat' => 'deportes-fitness', 'name' => 'Resistance Bands Set', 'price' => 29.99, 'compare' => 39.99, 'stock' => 100, 'desc' => '5-band resistance set with handles and door anchor.'],

            // Deportes > Outdoor
            ['cat' => 'deportes-outdoor', 'name' => 'Ultralight Camping Tent', 'price' => 299.99, 'compare' => null, 'stock' => 15, 'desc' => '2-person ultralight tent with waterproof fly and aluminum poles.'],
            ['cat' => 'deportes-outdoor', 'name' => 'Hydration Backpack 20L', 'price' => 79.99, 'compare' => 99.99, 'stock' => 30, 'desc' => 'Hiking backpack with 2L hydration bladder and multiple pockets.'],

            // Libros > Ficción
            ['cat' => 'libros-ficcion', 'name' => 'The Last Horizon', 'price' => 24.99, 'compare' => null, 'stock' => 200, 'desc' => 'A gripping sci-fi novel about humanitys last frontier. Bestseller 2024.'],
            ['cat' => 'libros-ficcion', 'name' => 'Midnight Gardens', 'price' => 18.99, 'compare' => 22.99, 'stock' => 150, 'desc' => 'A magical realism masterpiece set in colonial South America.'],

            // Libros > No Ficción
            ['cat' => 'libros-no-ficcion', 'name' => 'Atomic Habits', 'price' => 16.99, 'compare' => null, 'stock' => 300, 'desc' => 'An easy and proven way to build good habits and break bad ones.'],
            ['cat' => 'libros-no-ficcion', 'name' => 'The Psychology of Money', 'price' => 19.99, 'compare' => null, 'stock' => 250, 'desc' => 'Timeless lessons on wealth, greed, and happiness.'],

            // Belleza > Cuidado de Piel
            ['cat' => 'belleza-cuidado-de-piel', 'name' => 'Vitamin C Serum', 'price' => 34.99, 'compare' => 44.99, 'stock' => 80, 'desc' => '20% Vitamin C serum with hyaluronic acid for brighter skin.'],
            ['cat' => 'belleza-cuidado-de-piel', 'name' => 'Retinol Night Cream', 'price' => 49.99, 'compare' => null, 'stock' => 55, 'desc' => 'Advanced retinol cream for anti-aging and skin renewal.'],

            // Belleza > Maquillaje
            ['cat' => 'belleza-maquillaje', 'name' => 'Matte Lipstick Collection', 'price' => 39.99, 'compare' => 54.99, 'stock' => 90, 'desc' => '6-shade matte lipstick set with long-lasting formula.'],
            ['cat' => 'belleza-maquillaje', 'name' => 'Foundation HD Pro', 'price' => 42.99, 'compare' => null, 'stock' => 65, 'desc' => 'Full coverage HD foundation with SPF 30 in 40 shades.'],

            // Belleza > Fragancias
            ['cat' => 'belleza-fragancias', 'name' => 'Ocean Breeze EDT 100ml', 'price' => 89.99, 'compare' => 119.99, 'stock' => 40, 'desc' => 'Fresh and invigorating eau de toilette with marine and citrus notes.'],

            // Juguetes > Educativos
            ['cat' => 'juguetes-educativos', 'name' => 'STEM Robot Kit', 'price' => 79.99, 'compare' => null, 'stock' => 45, 'desc' => 'Programmable robot building kit for kids 8+. Learn coding basics.'],
            ['cat' => 'juguetes-educativos', 'name' => 'World Map Puzzle 1000pc', 'price' => 24.99, 'compare' => 29.99, 'stock' => 70, 'desc' => 'Detailed illustrated world map jigsaw puzzle.'],

            // Juguetes > Figuras de Acción
            ['cat' => 'juguetes-figuras-de-accion', 'name' => 'Superhero Collection Set', 'price' => 49.99, 'compare' => null, 'stock' => 55, 'desc' => '6 articulated superhero action figures with accessories.'],

            // Juguetes > Juegos de Mesa
            ['cat' => 'juguetes-juegos-de-mesa', 'name' => 'Strategy Empire', 'price' => 44.99, 'compare' => null, 'stock' => 40, 'desc' => 'Epic strategy board game for 2-6 players. Build your empire!'],
            ['cat' => 'juguetes-juegos-de-mesa', 'name' => 'Family Trivia Night', 'price' => 29.99, 'compare' => 34.99, 'stock' => 60, 'desc' => 'Fun trivia game with 2000 questions for the whole family.'],

            // Automotriz > Accesorios
            ['cat' => 'automotriz-accesorios', 'name' => 'Dash Cam 4K', 'price' => 149.99, 'compare' => 199.99, 'stock' => 30, 'desc' => '4K front and rear dash camera with night vision and GPS.'],
            ['cat' => 'automotriz-accesorios', 'name' => 'Car Phone Mount', 'price' => 24.99, 'compare' => null, 'stock' => 150, 'desc' => 'Magnetic phone mount with 360 rotation for any vehicle.'],

            // Automotriz > Herramientas
            ['cat' => 'automotriz-herramientas', 'name' => 'Mechanic Tool Set 230pc', 'price' => 199.99, 'compare' => 279.99, 'stock' => 20, 'desc' => 'Professional 230-piece mechanic tool set in rolling case.'],
        ];

        foreach ($products as $p) {
            $category = Category::where('slug', $p['cat'])->first();
            if (!$category) continue;

            $product = Product::create([
                'category_id' => $category->id,
                'name' => $p['name'],
                'slug' => Str::slug($p['name']),
                'description' => $p['desc'],
                'short_description' => Str::limit($p['desc'], 120),
                'price' => $p['price'],
                'compare_price' => $p['compare'] ?? null,
                'sku' => 'NXS-' . strtoupper(Str::random(8)),
                'stock' => $p['stock'],
                'is_active' => true,
                'is_featured' => $p['featured'] ?? false,
            ]);

            $slug = Str::slug($p['name']);
            $localImage = "products/{$slug}.jpg";
            $imagePath = Storage::disk('public')->exists($localImage)
                ? $localImage
                : "https://placehold.co/600x600/2a7d8a/white?text=" . urlencode($p['name']);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $imagePath,
                'alt_text' => $p['name'],
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
