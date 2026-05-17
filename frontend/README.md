# NexoShop — Frontend (Angular SPA)

Aplicación cliente de la tienda online **NexoShop**, construida con **Angular 20** (standalone components, lazy loading) y **Tailwind CSS 4**. Consume la API REST del backend Laravel y soporta navegación pública, área de usuario y panel de administración.

## Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | Angular 20 (standalone components, signals-ready) |
| Estilos | Tailwind CSS 4 (PostCSS) |
| i18n | @ngx-translate/core 17 (ES / EN) |
| HTTP / reactividad | RxJS 7 |
| Build | Angular CLI 20 (@angular/build) |
| Testing | Karma + Jasmine 5 |
| Lenguaje | TypeScript 5.9 |

## Estructura

```
frontend/src/app/
├── core/
│   ├── guards/              # authGuard, adminGuard, checkoutGuard
│   ├── interceptors/        # auth (Bearer token), error (toasts globales)
│   ├── models/              # Tipos: Product, Order, Cart, User, ...
│   └── services/            # Servicios HTTP a la API y utilidades
├── features/                # Vistas (lazy-loaded por ruta)
│   ├── home/                # Landing con destacados y novedades
│   ├── products/            # Listado y detalle de producto
│   ├── cart/                # Carrito
│   ├── checkout/            # Checkout + confirmación
│   ├── auth/                # Login, registro, forgot-password
│   ├── account/             # Perfil, pedidos, direcciones, wishlist
│   ├── admin/               # Dashboard, CRUDs y ajustes
│   └── errors/              # 404
├── shared/
│   ├── components/          # Header, footer, product-card, toast, star-rating
│   └── pipes/               # currency-format
├── assets/i18n/             # es.json, en.json
└── environments/            # environment.ts / environment.prod.ts
```

## Características

- **Catálogo público** — listado con filtros, búsqueda y detalle de productos con galería de imágenes
- **Carrito** persistente (sesión sin login → merge al iniciar sesión)
- **Checkout** con guard que valida carrito no vacío y dirección de envío
- **Cuenta de usuario** — perfil, historial de pedidos, direcciones múltiples, wishlist, cambio de contraseña
- **Panel admin** — productos (CRUD + imágenes), categorías, pedidos, usuarios, cupones, reseñas, settings
- **Internacionalización** — español (PEN) e inglés (USD) con tipo de cambio dinámico
- **Auth** con Sanctum (token Bearer) y guards de ruta (`authGuard`, `adminGuard`, `checkoutGuard`)
- **Interceptors** — inyección automática del token y manejo global de errores con toasts
- **Lazy loading** — todas las rutas se cargan bajo demanda para optimizar el bundle inicial

## Servicios principales (`core/services`)

| Servicio | Responsabilidad |
|---|---|
| `auth.service` | Login/logout, registro, gestión del token, usuario actual |
| `product.service` | Listado, detalle, destacados, relacionados |
| `category.service` | Árbol y detalle de categorías |
| `cart.service` | Estado reactivo del carrito (signals/observables) |
| `order.service` | Crear, listar, cancelar pedidos |
| `payment.service` | Generar preferencia MercadoPago |
| `address.service` | CRUD de direcciones del usuario |
| `wishlist.service` | Toggle y consulta de favoritos |
| `coupon.service` | Validar cupón en checkout |
| `review.service` | Listar y crear reseñas |
| `search.service` | Búsqueda + autocomplete |
| `admin.service` | Endpoints del panel admin (stats, CRUDs) |
| `toast.service` | Notificaciones globales |
| `storage.service` | Wrapper de localStorage |

## Rutas

| Ruta | Acceso |
|---|---|
| `/` | público — home |
| `/products` · `/products/:slug` | público — catálogo |
| `/cart` | público — carrito |
| `/checkout` · `/checkout/confirmation` | `authGuard` + `checkoutGuard` |
| `/auth/login` · `/auth/register` · `/auth/forgot-password` | público |
| `/account/*` (profile, orders, addresses, wishlist, ...) | `authGuard` |
| `/admin/*` (dashboard, products, orders, users, ...) | `authGuard` + `adminGuard` |
| `**` | 404 |

## Requisitos

- Node.js **18+**
- npm 9+ (o pnpm/yarn)
- Backend NexoShop corriendo en `http://localhost:8000` (configurable en `environment.ts`)

## Instalación

```bash
npm install
```

## Configuración de entorno

Editar `src/environments/environment.ts` (dev) y `environment.prod.ts` (prod):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  appName: 'NexoShop',
  defaultLang: 'es',
  currencies: {
    es: { code: 'PEN', symbol: 'S/' },
    en: { code: 'USD', symbol: '$' }
  }
};
```

## Scripts

```bash
npm start              # ng serve  → http://localhost:4200
npm run build          # build de producción → dist/
npm run watch          # build incremental modo dev
npm test               # tests unitarios con Karma + Jasmine
```

## Desarrollo

```bash
npm start
```

La app queda disponible en `http://localhost:4200/` con hot reload. Asegúrate de que el backend Laravel esté corriendo en el puerto configurado en `environment.apiUrl`.

## Build de producción

```bash
npm run build
```

Los artefactos se generan en `dist/frontend/`. Servir el contenido con cualquier servidor estático (Nginx, Apache, Caddy) y enrutar todas las rutas no encontradas a `index.html` para que funcione el router de Angular.

Ejemplo Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Testing

```bash
npm test                                # ejecuta Karma + Jasmine
npm test -- --code-coverage             # con cobertura
```

## i18n

Idiomas en `src/assets/i18n/{es,en}.json`. El idioma activo cambia también la moneda mostrada (PEN / USD) usando el tipo de cambio del endpoint `/api/exchange-rate` del backend.

## Convenciones

- **Componentes standalone** — sin NgModules, importan dependencias directamente
- **Lazy loading por ruta** — `loadComponent: () => import(...)`
- **Tailwind 4** — utility-first, sin SASS personalizado en la mayoría de casos
- **Prettier** — `printWidth: 100`, `singleQuote: true`

## Licencia

Proyecto propietario — © Carlos Santaella.
