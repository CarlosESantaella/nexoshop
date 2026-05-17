# NexoShop

Tienda online full-stack desarrollada con Laravel (backend) y Angular (frontend).

## Stack

- **Backend:** Laravel (PHP) — API REST
- **Frontend:** Angular — SPA
- **Base de datos:** MySQL

## Estructura del proyecto

```
nexoshop/
├── backend/    # API Laravel
└── frontend/   # Aplicación Angular
```

## Requisitos

- PHP 8.x
- Composer
- Node.js 18+
- npm
- MySQL
- Angular CLI

## Instalación

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

## Desarrollo

- Backend disponible en `http://localhost:8000`
- Frontend disponible en `http://localhost:4200`

## Autor

Carlos Santaella
