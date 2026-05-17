import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { StorageService } from './core/services/storage.service';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HeaderComponent, FooterComponent, ToastComponent],
  styles: [`
    @keyframes app-spin { to { transform: rotate(360deg); } }
    @keyframes app-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes app-fab-in { from { opacity: 0; transform: scale(0.5) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .app-spinner { animation: app-spin 1s linear infinite; }
    .app-fade-in { animation: app-fade-in 0.3s ease-out both; }
    .app-fab-in { animation: app-fab-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  `],
  template: `
    @if (appReady()) {
      <div class="app-fade-in">
        @if (!isAdminRoute) {
          <app-header />
        }
        <main [class.min-h-screen]="!isAdminRoute">
          <router-outlet />
        </main>
        @if (!isAdminRoute) {
          <app-footer />
        }
      </div>
    } @else {
      <!-- Loading screen while auth initializes -->
      <div class="fixed inset-0 bg-slate-900 flex items-center justify-center z-[9999]">
        <div class="flex flex-col items-center gap-5">
          <div class="relative">
            <div class="w-12 h-12 rounded-full border-[3px] border-slate-700"></div>
            <div class="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-primary-400 app-spinner"></div>
          </div>
          <img src="assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-8 w-auto" style="filter: brightness(0) invert(1); opacity: 0.6;" />
        </div>
      </div>
    }
    <!-- Floating Cart FAB -->
    @if (!isAdminRoute && !isCartRoute && cartService.itemCount() > 0) {
      <a routerLink="/cart" (click)="scrollTop()"
         class="app-fab-in fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
                bg-gradient-to-br from-primary-600 to-primary-700 text-white
                shadow-xl shadow-primary-600/30 hover:shadow-2xl hover:shadow-primary-600/40
                hover:-translate-y-1 active:scale-95 transition-[transform,box-shadow] duration-300
                flex items-center justify-center">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
        </svg>
        <span class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-accent-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
          {{ cartService.itemCount() }}
        </span>
      </a>
    }
    <app-toast />
  `,
})
export class AppComponent {
  isAdminRoute = false;
  isCartRoute = false;
  appReady = signal(false);
  cartService = inject(CartService);

  scrollTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  constructor() {
    const router = inject(Router);
    const translate = inject(TranslateService);
    const storage = inject(StorageService);
    const authService = inject(AuthService);

    // Detect admin route immediately from current URL (before NavigationEnd fires)
    this.isAdminRoute = window.location.pathname.startsWith('/admin');

    const savedLang = storage.get('app_lang');
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      translate.use(savedLang);
    }

    // Wait for auth to resolve before showing the app
    authService.ensureInitialized().then(() => {
      this.appReady.set(true);
    });

    this.isCartRoute = window.location.pathname.startsWith('/cart') || window.location.pathname.startsWith('/checkout');

    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      // Instant scroll on navigation — smooth fights with page render and causes stutter
      window.scrollTo(0, 0);
      const url = (event as NavigationEnd).urlAfterRedirects;
      this.isAdminRoute = url.startsWith('/admin');
      this.isCartRoute = url.startsWith('/cart') || url.startsWith('/checkout');
    });
  }
}
