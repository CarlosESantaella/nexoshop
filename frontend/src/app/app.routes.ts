import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent),
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard, checkoutGuard],
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'checkout/confirmation',
    loadComponent: () => import('./features/checkout/confirmation.component').then(m => m.ConfirmationComponent),
  },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('./features/account/profile.component').then(m => m.ProfileComponent) },
      { path: 'orders', loadComponent: () => import('./features/account/orders.component').then(m => m.OrdersComponent) },
      { path: 'orders/:orderNumber', loadComponent: () => import('./features/account/order-detail.component').then(m => m.OrderDetailComponent) },
      { path: 'addresses', loadComponent: () => import('./features/account/addresses.component').then(m => m.AddressesComponent) },
      { path: 'wishlist', loadComponent: () => import('./features/account/wishlist.component').then(m => m.WishlistComponent) },
      { path: 'change-password', loadComponent: () => import('./features/account/change-password.component').then(m => m.ChangePasswordComponent) },
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/products.component').then(m => m.ProductsComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'products/:id/edit', loadComponent: () => import('./features/admin/product-form.component').then(m => m.ProductFormComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories.component').then(m => m.CategoriesComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users.component').then(m => m.UsersComponent) },
      { path: 'coupons', loadComponent: () => import('./features/admin/coupons.component').then(m => m.CouponsComponent) },
      { path: 'reviews', loadComponent: () => import('./features/admin/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent),
  },
];
