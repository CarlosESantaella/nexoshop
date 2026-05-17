# NexoShop — Backend (API)

API REST de la tienda online **NexoShop** construida con **Laravel 13** y **PHP 8.3+**. Expone endpoints públicos para navegación, endpoints autenticados (Sanctum) para usuarios y un panel administrativo con control de productos, pedidos, cupones, reseñas y ajustes.

## Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | Laravel 13 |
| PHP | 8.3+ |
| Autenticación | Laravel Sanctum 4 (SPA + Personal Access Tokens) |
| Pagos | MercadoPago DX-PHP 3.8 |
| Imágenes | Intervention Image 4 |
| Base de datos | SQLite (default) / MySQL / PostgreSQL |
| Cache & Queue | Database driver |
| Testing | PHPUnit 12 + Mockery |
| Linter | Laravel Pint |

## Estructura

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/        # Controladores públicos y autenticados
│   │   │   └── Admin/              # Controladores del panel admin
│   │   └── Middleware/             # AdminMiddleware
│   ├── Models/                     # Eloquent: User, Product, Order, Cart, ...
│   └── Services/                   # CartService, OrderService, ImageService,
│                                   # ExchangeRateService, SettingService
├── database/
│   ├── migrations/                 # Esquema de tablas
│   ├── seeders/                    # Datos de demo
│   └── factories/
├── routes/
│   ├── api.php                     # Rutas REST
│   └── web.php
└── tests/                          # Suites PHPUnit
```

## Modelo de dominio

- **User** — usuarios con rol (`admin` / cliente), perfil y direcciones
- **Product / ProductImage / Category** — catálogo con imágenes múltiples y categorías jerárquicas
- **Cart / CartItem** — carrito persistente por sesión o usuario, con merge al login
- **Order / OrderItem** — pedidos con estados, totales, dirección de envío
- **Coupon** — descuentos por porcentaje o monto fijo con reglas de validez
- **Review** — reseñas de productos con moderación (aprobación admin)
- **Wishlist** — lista de deseos por usuario
- **Address** — direcciones de envío múltiples con dirección por defecto
- **Setting** — configuraciones de la tienda agrupadas (publicas/privadas)

## Endpoints principales

Base URL: `/api`

### Públicos
- `GET  /health` — health check
- `GET  /exchange-rate` — tipo de cambio PEN ↔ USD
- `GET  /products` · `/products/featured` · `/products/new-arrivals` · `/products/{slug}` · `/products/{slug}/related`
- `GET  /categories` · `/categories/{slug}`
- `GET  /products/{slug}/reviews`
- `GET  /search` · `/search/autocomplete`
- `*    /cart` · `/cart/items` — carrito por sesión o auth
- `POST /coupons/validate`
- `POST /payments/webhook` — webhook MercadoPago

### Autenticación (`/api/auth`, throttle 30/min)
- `POST /register` · `/login` · `/forgot-password` · `/reset-password`
- `POST /logout` · `GET /user` · `PUT /profile` · `PUT /change-password` *(auth)*

### Autenticados (`auth:sanctum`)
- `POST /cart/merge` — fusiona carrito de sesión con el del usuario al iniciar sesión
- `*    /wishlist` · `/wishlist/toggle` · `/wishlist/check`
- `*    /addresses` (API resource) + `PATCH /addresses/{id}/default`
- `GET  /orders` · `POST /orders` · `GET /orders/{orderNumber}` · `PATCH /orders/{orderNumber}/cancel`
- `POST /products/{slug}/reviews`
- `POST /payments/create-preference` — genera preferencia MercadoPago

### Admin (`auth:sanctum` + `admin`, prefix `/api/admin`)
- `GET /stats` — métricas del dashboard
- `*   /products` — CRUD + toggle featured/active + upload/delete/set-primary de imágenes
- `*   /categories` — CRUD
- `GET /orders` · `GET /orders/{id}` · `PATCH /orders/{id}/status`
- `GET /users` · `PATCH /users/{id}/toggle-active`
- `*   /coupons` — CRUD
- `GET /reviews` · `PATCH /reviews/{id}/approve` · `PATCH /reviews/{id}/reject`
- `GET /settings` · `GET /settings/{group}` · `PUT /settings`

> **Rate limiting:** todas las rutas tienen throttle (10–60 requests/min según endpoint).

## Requisitos

- PHP **8.3+** con extensiones: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `gd` o `imagick`
- Composer 2.x
- Node.js 18+ y npm (para assets de Vite)
- Base de datos: SQLite (por defecto), MySQL 8 o PostgreSQL 14+

## Instalación

```bash
# 1. Instalar dependencias
composer install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Base de datos (SQLite por defecto)
touch database/database.sqlite       # solo SQLite
php artisan migrate --seed

# 4. Storage symlink (uploads de imágenes)
php artisan storage:link

# 5. (Opcional) Build de assets si se sirven vistas
npm install && npm run build
```

## Variables de entorno relevantes

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200
SANCTUM_STATEFUL_DOMAINS=localhost:4200

DB_CONNECTION=sqlite                 # o mysql / pgsql

MERCADOPAGO_ACCESS_TOKEN=            # credencial privada MP
MERCADOPAGO_PUBLIC_KEY=              # credencial pública MP
MERCADOPAGO_WEBHOOK_SECRET=          # firma del webhook
```

## Ejecución

```bash
# Servidor de desarrollo (http://localhost:8000)
php artisan serve

# Modo full-stack (server + queue + vite en paralelo)
composer dev

# Worker de colas (jobs, emails, etc.)
php artisan queue:listen

# Logs en tiempo real
php artisan pail
```

## Testing

```bash
composer test           # ejecuta toda la suite
php artisan test --filter=ProductTest
./vendor/bin/pint       # formateo de código
```

## Autenticación

La API usa **Laravel Sanctum** con dos modos:

- **SPA stateful** (cookie + CSRF) para el frontend Angular en `SANCTUM_STATEFUL_DOMAINS`
- **Personal Access Tokens** (Bearer header) para clientes móviles o terceros

Tras `POST /api/auth/login` se devuelve el token en la respuesta y se incluye en cabeceras como:

```
Authorization: Bearer <token>
```

## Pagos (MercadoPago)

1. El frontend pide `POST /api/payments/create-preference` con el carrito y dirección
2. El backend crea la preferencia y devuelve `init_point`
3. El usuario completa el pago en el checkout de MercadoPago
4. MercadoPago llama a `POST /api/payments/webhook` con el resultado
5. El pedido pasa a estado `paid` (o `failed`) y se descuenta stock

## Licencia

Proyecto propietario — © Carlos Santaella.
