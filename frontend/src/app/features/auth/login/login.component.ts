import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, TranslateModule],
  styles: [`
    @keyframes auth-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes auth-slide-right {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes auth-glow-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
    :host { display: block; }
    .auth-fade-in { animation: auth-fade-in 0.6s ease-out both; }
    .auth-fade-in-d1 { animation: auth-fade-in 0.6s ease-out 0.1s both; }
    .auth-fade-in-d2 { animation: auth-fade-in 0.6s ease-out 0.2s both; }
    .auth-fade-in-d3 { animation: auth-fade-in 0.6s ease-out 0.3s both; }
    .auth-slide-right { animation: auth-slide-right 0.8s ease-out 0.15s both; }
    .auth-glow-pulse { animation: auth-glow-pulse 4s ease-in-out infinite; }
  `],
  template: `
    <div class="min-h-screen flex">

      <!-- ========== LEFT: BRAND PANEL ========== -->
      <div class="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden">
        <!-- Background image -->
        <img src="assets/images/auth-login-bg.jpg" alt=""
             class="absolute inset-0 w-full h-full object-cover object-center" loading="eager" />
        <!-- Dark overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900/[0.88] via-slate-800/[0.82] to-slate-900/[0.88]"></div>
        <!-- Tinted color wash -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-accent-900/20 mix-blend-multiply"></div>

        <!-- Decorative elements -->
        <div class="absolute top-1/4 -left-20 w-[350px] h-[350px] rounded-full bg-primary-500/[0.1] blur-[100px] auth-glow-pulse pointer-events-none"></div>
        <div class="absolute bottom-1/4 -right-16 w-[280px] h-[280px] rounded-full bg-accent-500/[0.08] blur-[80px] pointer-events-none"></div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <!-- Logo -->
          <div class="auth-slide-right">
            <img src="assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-10 w-auto" style="filter: brightness(0) invert(1); opacity: 0.9;" />
          </div>

          <!-- Center message -->
          <div class="auth-slide-right max-w-sm">
            <div class="flex items-center gap-3 mb-6">
              <span class="w-10 h-[3px] rounded-full bg-gradient-to-r from-accent-400 to-primary-400"></span>
            </div>
            <h2 class="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
                style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, white 0%, var(--color-primary-200) 50%, var(--color-accent-300) 100%);">
              {{ 'AUTH.LOGIN_SUBTITLE' | translate }}
            </h2>
            <p class="text-slate-400 leading-relaxed text-[15px]">
              {{ 'HOME.HERO_SUBTITLE' | translate }}
            </p>
          </div>

          <!-- Trust badges -->
          <div class="auth-slide-right flex items-center gap-6 text-slate-500">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              <span class="text-xs font-medium">{{ 'HOME.TRUST_SECURE' | translate }}</span>
            </div>
            <div class="w-px h-3 bg-slate-700"></div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-primary-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
              <span class="text-xs font-medium">{{ 'HOME.TRUST_DELIVERY' | translate }}</span>
            </div>
            <div class="w-px h-3 bg-slate-700"></div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
              </svg>
              <span class="text-xs font-medium">{{ 'HOME.TRUST_SUPPORT' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== RIGHT: FORM PANEL ========== -->
      <div class="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <div class="w-full max-w-[420px]">

          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-8 auth-fade-in">
            <img src="assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-12 w-auto mx-auto mb-3" />
            <p class="text-slate-400 text-sm">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>
          </div>

          <!-- Form header (desktop) -->
          <div class="hidden lg:block mb-10 auth-fade-in">
            <h1 class="text-2xl font-bold text-slate-800">{{ 'AUTH.LOGIN_TITLE' | translate }}</h1>
            <p class="text-slate-400 mt-1.5 text-sm">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>
          </div>

          <!-- Error message -->
          @if (errorMessage()) {
            <div class="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3.5 mb-6 auth-fade-in">
              <svg class="w-5 h-5 shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div class="auth-fade-in-d1">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.EMAIL' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                <input type="email" formControlName="email"
                       class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white
                              focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                       [placeholder]="'AUTH.EMAIL_PLACEHOLDER' | translate" />
              </div>
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('required')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.EMAIL_REQUIRED' | translate }}
                </p>
              }
              @if (loginForm.get('email')?.touched && loginForm.get('email')?.hasError('email')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.EMAIL_INVALID' | translate }}
                </p>
              }
            </div>

            <!-- Password -->
            <div class="auth-fade-in-d2">
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'AUTH.PASSWORD' | translate }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                </svg>
                <input [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                       class="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl text-sm bg-white
                              focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"
                       [placeholder]="'AUTH.PASSWORD_PLACEHOLDER' | translate" />
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  @if (showPassword()) {
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
                  } @else {
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  }
                </button>
              </div>
              @if (loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')) {
                <p class="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  {{ 'AUTH.PASSWORD_REQUIRED' | translate }}
                </p>
              }
            </div>

            <!-- Remember + Forgot -->
            <div class="flex items-center justify-between auth-fade-in-d2">
              <label class="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" formControlName="remember"
                       class="w-[18px] h-[18px] rounded-md border-2 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-colors" />
                <span class="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">{{ 'AUTH.REMEMBER_ME' | translate }}</span>
              </label>
              <a routerLink="/auth/forgot-password"
                 class="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                {{ 'AUTH.FORGOT_PASSWORD' | translate }}
              </a>
            </div>

            <!-- Submit -->
            <div class="auth-fade-in-d3 pt-1">
              <button type="submit" [disabled]="loginForm.invalid || loading()"
                      class="group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white text-[15px]
                             bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                             transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30
                             hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
                @if (loading()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                }
                {{ 'AUTH.LOGIN' | translate }}
                @if (!loading()) {
                  <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                }
              </button>
            </div>
          </form>

          <!-- Divider -->
          <div class="relative my-8 auth-fade-in-d3">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
          </div>

          <!-- Register link -->
          <p class="text-center text-sm text-slate-400 auth-fade-in-d3">
            {{ 'AUTH.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors ml-1">{{ 'AUTH.CREATE_ACCOUNT' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  loginForm: FormGroup = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required]], remember: [false] });

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true); this.errorMessage.set('');
    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.cartService.mergeCarts().subscribe({
            complete: () => {
              this.wishlistService.loadWishlist();
              this.toast.success(this.translate.instant('TOAST.WELCOME_BACK'));
              this.router.navigateByUrl(returnUrl);
              this.loading.set(false);
            },
            error: () => {
              this.wishlistService.loadWishlist();
              this.cartService.loadCart();
              this.toast.warning(this.translate.instant('TOAST.CART_MERGE_WARNING'));
              this.toast.success(this.translate.instant('TOAST.WELCOME_BACK'));
              this.router.navigateByUrl(returnUrl);
              this.loading.set(false);
            }
          });
        } else { this.loading.set(false); }
      },
      error: (err) => { this.errorMessage.set(err.error?.message || 'Invalid credentials'); this.loading.set(false); }
    });
  }
}
