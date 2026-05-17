import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItem } from '../../core/models/cart.model';
import { CouponValidation } from '../../core/models/coupon.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, CurrencyFormatPipe],
  styles: [`
    @keyframes ct-fade-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ct-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes ct-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    :host { display: block; }
    .ct-fade-in { animation: ct-fade-in 0.5s ease-out both; }
    .ct-fade-in-d1 { animation: ct-fade-in 0.5s ease-out 0.06s both; }
    .ct-fade-in-d2 { animation: ct-fade-in 0.5s ease-out 0.12s both; }
    .ct-fade-in-d3 { animation: ct-fade-in 0.5s ease-out 0.18s both; }
    .ct-float { animation: ct-float 3s ease-in-out infinite; }
  `],
  template: `
    <!-- ========== PAGE HEADER ========== -->
    <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-1/2 -translate-y-1/2 -right-20 w-[280px] h-[280px] rounded-full bg-primary-500/[0.06] blur-[80px] pointer-events-none"></div>
      <div class="absolute -bottom-10 left-1/3 w-[180px] h-[180px] rounded-full bg-accent-500/[0.05] blur-[60px] pointer-events-none"></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-10 md:pb-16 relative z-10">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm mb-6 ct-fade-in">
          <a routerLink="/" class="text-slate-400 hover:text-white transition-colors duration-200">{{ 'COMMON.HOME' | translate }}</a>
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          <span class="text-white/90 font-medium">{{ 'CART.TITLE' | translate }}</span>
        </nav>

        <div class="flex items-end justify-between ct-fade-in-d1">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight"
                style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, white, var(--color-primary-100), var(--color-accent-300));">
              {{ 'CART.TITLE' | translate }}
            </h1>
            @if (cartService.itemCount() > 0) {
              <p class="text-slate-400 mt-2 text-sm">
                {{ cartService.itemCount() }}
                {{ (cartService.itemCount() === 1 ? 'CART.PRODUCT' : 'CART.PRODUCT') | translate }}
              </p>
            }
          </div>

          <!-- Progress indicator -->
          @if (cartService.itemCount() > 0) {
            <div class="hidden sm:flex items-center gap-3 ct-fade-in-d2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                </div>
                <span class="text-white/90 text-xs font-semibold uppercase tracking-wider">{{ 'NAV.CART' | translate }}</span>
              </div>
              <div class="w-8 h-px bg-slate-600"></div>
              <div class="flex items-center gap-2 opacity-40">
                <div class="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span class="text-white/40 text-xs font-medium uppercase tracking-wider">{{ 'CHECKOUT.STEP_SHIPPING' | translate }}</span>
              </div>
              <div class="w-8 h-px bg-slate-700"></div>
              <div class="flex items-center gap-2 opacity-40">
                <div class="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
                <span class="text-white/40 text-xs font-medium uppercase tracking-wider">{{ 'CHECKOUT.STEP_PAYMENT' | translate }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Wave divider -->
      <div class="absolute -bottom-px left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" class="relative block w-full h-8 md:h-12">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f9fafb"/>
        </svg>
      </div>
    </section>

    <!-- ========== CONTENT ========== -->
    <div class="bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        <!-- ===== EMPTY CART STATE ===== -->
        @if (cartService.itemCount() === 0) {
          <div class="max-w-lg mx-auto text-center ct-fade-in">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 md:p-14">
              <!-- Floating cart icon -->
              <div class="relative w-28 h-28 mx-auto mb-8">
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-primary-100/60 to-accent-100/40"></div>
                <div class="absolute inset-2 rounded-full bg-gradient-to-br from-primary-50 to-white flex items-center justify-center ct-float">
                  <svg class="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
                  </svg>
                </div>
              </div>
              <h2 class="text-2xl font-bold text-slate-800 mb-3">{{ 'CART.EMPTY_TITLE' | translate }}</h2>
              <p class="text-slate-400 mb-8 text-sm leading-relaxed max-w-xs mx-auto">{{ 'CART.EMPTY_MESSAGE' | translate }}</p>
              <a routerLink="/products"
                 class="group inline-flex items-center gap-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                        text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-primary-600/20
                        hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5">
                {{ 'CART.START_SHOPPING' | translate }}
                <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            </div>
          </div>

        <!-- ===== CART WITH ITEMS ===== -->
        } @else {
          <div class="flex flex-col lg:flex-row gap-8">

            <!-- ===== CART ITEMS ===== -->
            <div class="flex-1 min-w-0">

              <!-- Desktop: Card-based list -->
              <div class="hidden md:block space-y-3 ct-fade-in">
                @for (item of cartService.cart()?.items || []; track item.id; let idx = $index) {
                  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden">
                    <div class="flex items-center gap-5 p-5">
                      <!-- Image -->
                      <a [routerLink]="['/products', item.product.slug]" class="shrink-0 relative group">
                        <div class="w-[88px] h-[88px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                          <img [src]="item.product.primary_image || '/assets/images/placeholder.png'" [alt]="item.product.name"
                               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      </a>

                      <!-- Product info -->
                      <div class="flex-1 min-w-0">
                        <a [routerLink]="['/products', item.product.slug]"
                           class="font-semibold text-slate-800 hover:text-primary-600 transition-colors line-clamp-1 text-[15px]">
                          {{ item.product.name }}
                        </a>
                        <p class="text-sm text-slate-400 mt-1">{{ item.price | currencyFormat }} / u.</p>
                      </div>

                      <!-- Quantity -->
                      <div class="shrink-0">
                        <div class="inline-flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                          <button (click)="updateQuantity(item, item.quantity - 1)"
                                  [class.opacity-40]="item.quantity <= 1" [class.cursor-not-allowed]="item.quantity <= 1"
                                  class="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
                          </button>
                          <span class="w-10 h-9 flex items-center justify-center text-sm font-semibold text-slate-800 border-x border-slate-200 bg-white tabular-nums">{{ item.quantity }}</span>
                          <button (click)="updateQuantity(item, item.quantity + 1)"
                                  [class.opacity-40]="item.quantity >= item.product.stock" [class.cursor-not-allowed]="item.quantity >= item.product.stock"
                                  class="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                          </button>
                        </div>
                      </div>

                      <!-- Subtotal -->
                      <div class="shrink-0 text-right min-w-[100px]">
                        <span class="text-lg font-bold text-slate-800 tabular-nums">{{ item.subtotal | currencyFormat }}</span>
                      </div>

                      <!-- Remove -->
                      <button (click)="removeItem(item.id)"
                              class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Mobile: Compact cards -->
              <div class="md:hidden space-y-3 ct-fade-in">
                @for (item of cartService.cart()?.items || []; track item.id) {
                  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div class="flex gap-4">
                      <a [routerLink]="['/products', item.product.slug]" class="shrink-0">
                        <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                          <img [src]="item.product.primary_image || '/assets/images/placeholder.png'" [alt]="item.product.name"
                               class="w-full h-full object-cover" />
                        </div>
                      </a>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <a [routerLink]="['/products', item.product.slug]"
                             class="font-semibold text-slate-800 hover:text-primary-600 text-sm line-clamp-2 transition-colors">
                            {{ item.product.name }}
                          </a>
                          <button (click)="removeItem(item.id)"
                                  class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">{{ item.price | currencyFormat }} / u.</p>
                        <div class="flex items-center justify-between mt-3">
                          <div class="inline-flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                            <button (click)="updateQuantity(item, item.quantity - 1)"
                                    class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
                            </button>
                            <span class="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-800 border-x border-slate-200 bg-white tabular-nums">{{ item.quantity }}</span>
                            <button (click)="updateQuantity(item, item.quantity + 1)"
                                    class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                            </button>
                          </div>
                          <span class="font-bold text-slate-800 tabular-nums">{{ item.subtotal | currencyFormat }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Continue shopping link -->
              <div class="mt-6 ct-fade-in-d1">
                <a routerLink="/products"
                   class="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-primary-600 transition-colors">
                  <svg class="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  {{ 'CART.CONTINUE_SHOPPING' | translate }}
                </a>
              </div>
            </div>

            <!-- ===== ORDER SUMMARY ===== -->
            <div class="lg:w-[380px] shrink-0 ct-fade-in-d2">
              <div class="sticky top-[152px]">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                  <!-- Summary header -->
                  <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                        </svg>
                      </div>
                      <h3 class="font-bold text-slate-800">{{ 'CART.ORDER_SUMMARY' | translate }}</h3>
                    </div>
                  </div>

                  <div class="p-6">
                    <!-- Coupon Section -->
                    <div class="mb-6">
                      <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{{ 'CART.COUPON_CODE' | translate }}</label>
                      <div class="flex gap-2">
                        <div class="flex-1 relative">
                          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/>
                          </svg>
                          <input type="text" [(ngModel)]="couponCode" [placeholder]="'CART.ENTER_COUPON' | translate"
                                 class="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50
                                        focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <button (click)="applyCoupon()" [disabled]="!couponCode || applyingCoupon()"
                                class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-all
                                       disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                          {{ 'CART.APPLY' | translate }}
                        </button>
                      </div>
                      @if (couponApplied()) {
                        <div class="flex items-center justify-between mt-3 text-sm bg-green-50 border border-green-100 px-3.5 py-2.5 rounded-xl">
                          <div class="flex items-center gap-2 text-green-700">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="font-medium">{{ appliedCoupon()?.coupon?.code }}</span>
                          </div>
                          <button (click)="removeCoupon()" class="text-red-400 hover:text-red-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      }
                    </div>

                    <!-- Divider -->
                    <div class="h-px bg-slate-100 mb-5"></div>

                    <!-- Line items -->
                    <div class="space-y-3.5 text-sm">
                      <div class="flex justify-between items-center">
                        <span class="text-slate-500">{{ 'CART.SUBTOTAL' | translate }}</span>
                        <span class="font-semibold text-slate-700 tabular-nums">{{ cartService.subtotal() | currencyFormat }}</span>
                      </div>
                      @if (couponApplied() && appliedCoupon()) {
                        <div class="flex justify-between items-center">
                          <span class="text-green-600 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/></svg>
                            {{ 'CART.DISCOUNT' | translate }}
                          </span>
                          <span class="font-semibold text-green-600 tabular-nums">-{{ appliedCoupon()!.discount | currencyFormat }}</span>
                        </div>
                      }
                      <div class="flex justify-between items-center">
                        <span class="text-slate-500">{{ 'CART.SHIPPING' | translate }}</span>
                        <span class="text-slate-400 text-xs italic">{{ 'CART.CALCULATED_AT_CHECKOUT' | translate }}</span>
                      </div>
                    </div>

                    <!-- Total -->
                    <div class="mt-5 pt-5 border-t-2 border-slate-100">
                      <div class="flex justify-between items-baseline">
                        <span class="text-base font-bold text-slate-800">{{ 'CART.TOTAL' | translate }}</span>
                        <span class="text-2xl font-bold tabular-nums"
                              style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, var(--color-slate-800), var(--color-primary-700));">
                          {{ (couponApplied() && appliedCoupon() ? appliedCoupon()!.new_total : cartService.subtotal()) | currencyFormat }}
                        </span>
                      </div>
                    </div>

                    <!-- Checkout CTA -->
                    <a routerLink="/checkout"
                       class="group flex items-center justify-center gap-2.5 w-full mt-6 py-4 rounded-xl font-semibold text-white text-[15px]
                              bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                              transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5">
                      {{ 'CART.PROCEED_TO_CHECKOUT' | translate }}
                      <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </a>

                    <!-- Trust badges -->
                    <div class="mt-5 pt-5 border-t border-slate-100">
                      <div class="flex items-center justify-center gap-5 text-slate-400">
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                          </svg>
                          <span class="text-[11px] font-medium">{{ 'HOME.TRUST_SECURE' | translate }}</span>
                        </div>
                        <div class="w-px h-3 bg-slate-200"></div>
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                          </svg>
                          <span class="text-[11px] font-medium">{{ 'HOME.TRUST_SHIPPING' | translate }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CartComponent {
  cartService = inject(CartService);
  private couponService = inject(CouponService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  couponCode = '';
  applyingCoupon = signal(false);
  couponApplied = signal(false);
  appliedCoupon = signal<CouponValidation | null>(null);

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1 || quantity > item.product.stock) return;
    this.cartService.updateItem(item.id, quantity).subscribe({ error: () => this.toast.error(this.translate.instant('TOAST.FAILED_UPDATE_QUANTITY')) });
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: res => { if (res.success) this.toast.success(this.translate.instant('TOAST.ITEM_REMOVED')); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_REMOVE_ITEM'))
    });
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) return;
    this.applyingCoupon.set(true);
    this.couponService.validateCoupon(code, this.cartService.subtotal()).subscribe({
      next: res => { if (res.success && res.data) { this.appliedCoupon.set(res.data); this.couponApplied.set(true); this.toast.success(this.translate.instant('TOAST.COUPON_APPLIED')); } this.applyingCoupon.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.COUPON_INVALID')); this.applyingCoupon.set(false); }
    });
  }

  removeCoupon(): void { this.appliedCoupon.set(null); this.couponApplied.set(false); this.couponCode = ''; }
}
