import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ProductCardComponent],
  styles: [`
    @keyframes nx-pulse-soft {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }
    @keyframes nx-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes nx-fade-up {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nx-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(92, 196, 166, 0.15), 0 0 60px rgba(53, 150, 161, 0.08); }
      50% { box-shadow: 0 0 30px rgba(92, 196, 166, 0.3), 0 0 80px rgba(53, 150, 161, 0.15); }
    }

    :host { display: block; }

    .nx-pulse-soft { animation: nx-pulse-soft 4s ease-in-out infinite; }

    .nx-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: nx-shimmer 1.8s ease-in-out infinite;
    }

    .nx-fade-up { animation: nx-fade-up 0.7s ease-out both; }
    .nx-fade-up-d1 { animation: nx-fade-up 0.7s ease-out 0.1s both; }
    .nx-fade-up-d2 { animation: nx-fade-up 0.7s ease-out 0.2s both; }
    .nx-fade-up-d3 { animation: nx-fade-up 0.7s ease-out 0.35s both; }
    .nx-glow { animation: nx-glow 3s ease-in-out infinite; }

    .nx-glass {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .nx-text-gradient {
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
  `],
  template: `
    <!-- ========== HERO ========== -->
    <section class="relative min-h-screen flex items-center overflow-hidden">
      <!-- Background image -->
      <div class="absolute inset-0">
        <img src="assets/images/hero-shopping.webp"
             alt=""
             class="w-full h-full object-cover object-top"
             loading="eager" />
        <!-- Gradient overlay: strong left for readability, fading right to reveal photo -->
        <div class="absolute inset-0 bg-slate-900/70 md:bg-transparent md:bg-gradient-to-r md:from-slate-900 md:via-slate-900/90 md:to-slate-900/30"></div>
        <!-- Extra bottom darkening for shape divider blend -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 md:py-32">
        <!-- Logo watermark - desktop only -->
        <img src="assets/logo/nexoshop-logo-only.webp" alt=""
             class="hidden lg:block absolute -top-32 -right-6 xl:-right-2 w-[280px] xl:w-[340px] opacity-[0.12] pointer-events-none select-none" />
        <div class="max-w-2xl">
          <!-- Heading -->
          <h1 class="nx-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
            <span class="nx-text-gradient bg-gradient-to-r from-white via-primary-100 to-accent-300">
              {{ 'HOME.HERO_TITLE' | translate }}
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="nx-fade-up-d1 text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed mb-12">
            {{ 'HOME.HERO_SUBTITLE' | translate }}
          </p>

          <!-- CTAs -->
          <div class="nx-fade-up-d2 flex flex-col sm:flex-row gap-4">
            <a routerLink="/products"
               class="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-[transform,box-shadow] duration-500 hover:shadow-2xl hover:shadow-accent-500/25 hover:-translate-y-0.5 nx-glow">
              <span>{{ 'HOME.SHOP_NOW' | translate }}</span>
              <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a routerLink="/products" [queryParams]="{sort_by: 'newest'}"
               class="inline-flex items-center justify-center gap-3 bg-white/[0.1] nx-glass border border-white/[0.15] text-white/90 font-medium px-8 py-4 rounded-2xl text-lg transition-colors duration-300 hover:bg-white/[0.18] hover:border-white/[0.25]">
              <span>{{ 'HOME.VIEW_ALL' | translate }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Shape Divider (triangle from shapedivider.app) -->
      <div class="absolute -bottom-1 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none"
             class="relative block h-[100px] md:h-[195px]" style="width: calc(153% + 1.3px);">
          <path d="M1200 0L0 0 598.97 114.72 1200 0z" fill="#f9fafb"/>
        </svg>
      </div>
    </section>

    <!-- ========== TRUST BADGES ========== -->
    <section class="relative z-20 -mt-14">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/20 overflow-hidden">
          <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/[0.06]">
            <div class="flex flex-col items-center text-center gap-2 px-4 py-4 lg:flex-row lg:text-left lg:gap-3.5 lg:px-6 lg:py-5">
              <div class="shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-accent-500/15 flex items-center justify-center">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs lg:text-sm font-semibold text-white leading-tight">{{ 'HOME.TRUST_SHIPPING' | translate }}</p>
                <p class="text-[10px] lg:text-[11px] text-slate-400 mt-0.5 hidden lg:block">{{ 'HOME.TRUST_SHIPPING_DESC' | translate }}</p>
              </div>
            </div>
            <div class="flex flex-col items-center text-center gap-2 px-4 py-4 lg:flex-row lg:text-left lg:gap-3.5 lg:px-6 lg:py-5">
              <div class="shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary-400/15 flex items-center justify-center">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs lg:text-sm font-semibold text-white leading-tight">{{ 'HOME.TRUST_SECURE' | translate }}</p>
                <p class="text-[10px] lg:text-[11px] text-slate-400 mt-0.5 hidden lg:block">{{ 'HOME.TRUST_SECURE_DESC' | translate }}</p>
              </div>
            </div>
            <div class="flex flex-col items-center text-center gap-2 px-4 py-4 lg:flex-row lg:text-left lg:gap-3.5 lg:px-6 lg:py-5">
              <div class="shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-accent-500/15 flex items-center justify-center">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs lg:text-sm font-semibold text-white leading-tight">{{ 'HOME.TRUST_DELIVERY' | translate }}</p>
                <p class="text-[10px] lg:text-[11px] text-slate-400 mt-0.5 hidden lg:block">{{ 'HOME.TRUST_DELIVERY_DESC' | translate }}</p>
              </div>
            </div>
            <div class="flex flex-col items-center text-center gap-2 px-4 py-4 lg:flex-row lg:text-left lg:gap-3.5 lg:px-6 lg:py-5">
              <div class="shrink-0 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary-400/15 flex items-center justify-center">
                <svg class="w-4 h-4 lg:w-5 lg:h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs lg:text-sm font-semibold text-white leading-tight">{{ 'HOME.TRUST_SUPPORT' | translate }}</p>
                <p class="text-[10px] lg:text-[11px] text-slate-400 mt-0.5 hidden lg:block">{{ 'HOME.TRUST_SUPPORT_DESC' | translate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== CATEGORIES ========== -->
    <section class="py-20 lg:py-28 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section header -->
        <div class="text-center mb-14">
          <span class="inline-block text-xs font-semibold text-primary-600 uppercase tracking-widest mb-3">{{ 'HOME.CATEGORY_SUBTITLE' | translate }}</span>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-800">{{ 'HOME.SHOP_BY_CATEGORY' | translate }}</h2>
        </div>

        <!-- Category grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          @for (category of categories(); track category.id; let i = $index) {
            <a [routerLink]="['/products']" [queryParams]="{category: category.slug}"
               class="group relative rounded-2xl p-6 lg:p-7 text-center overflow-hidden transition-[transform,box-shadow] duration-400 hover:-translate-y-1.5 hover:shadow-xl"
               [ngClass]="i % 4 === 0 ? 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg shadow-primary-600/20' :
                          i % 4 === 1 ? 'bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-500/20' :
                          i % 4 === 2 ? 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-700/20' :
                                        'bg-gradient-to-br from-primary-500 to-accent-600 shadow-lg shadow-primary-500/20'">
              <!-- Decorative circle -->
              <div class="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-white/[0.06] group-hover:scale-125 transition-transform duration-500"></div>
              <div class="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/[0.04]"></div>

              <div class="relative z-10">
                <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.12] flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.2] transition-transform duration-300">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                  </svg>
                </div>
                <h3 class="font-bold text-white text-[15px] leading-tight mb-1.5">{{ 'CAT.' + category.slug | translate }}</h3>
                <p class="text-xs text-white/60 font-medium">{{ category.products_count || 0 }} {{ 'HOME.PRODUCTS' | translate }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ========== FEATURED PRODUCTS ========== -->
    <section class="py-20 lg:py-28 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section header -->
        <div class="flex items-end justify-between mb-12">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-[3px] rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-slate-800">{{ 'HOME.FEATURED_PRODUCTS' | translate }}</h2>
            <p class="text-slate-400 mt-2">{{ 'HOME.FEATURED_SUBTITLE' | translate }}</p>
          </div>
          <a routerLink="/products" [queryParams]="{featured: true}"
             class="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-5 py-2.5 rounded-xl transition-all duration-300 group">
            {{ 'HOME.VIEW_ALL' | translate }}
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loadingFeatured()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div class="relative aspect-square bg-slate-100 overflow-hidden">
                  <div class="absolute inset-0 nx-shimmer"></div>
                </div>
                <div class="p-5 space-y-3">
                  <div class="h-3 bg-slate-100 rounded-full w-1/3 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="h-4 bg-slate-100 rounded-full w-4/5 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="h-3 bg-slate-100 rounded-full w-1/4 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="pt-2">
                    <div class="h-5 bg-slate-100 rounded-full w-2/5 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of featuredProducts(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }

        <!-- Mobile view all -->
        <div class="mt-8 text-center md:hidden">
          <a routerLink="/products" [queryParams]="{featured: true}"
             class="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 px-6 py-3 rounded-xl transition-colors hover:bg-primary-100">
            {{ 'HOME.VIEW_ALL' | translate }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ========== NEW ARRIVALS ========== -->
    <section class="py-20 lg:py-28 bg-gray-50 relative overflow-hidden">
      <!-- Decorative blur -->
      <div class="absolute top-0 right-0 w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-to-bl from-primary-100/30 to-transparent blur-[100px] pointer-events-none"></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Section header -->
        <div class="flex items-end justify-between mb-12">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-[3px] rounded-full bg-gradient-to-r from-accent-500 to-primary-500"></span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-slate-800">{{ 'HOME.NEW_ARRIVALS' | translate }}</h2>
            <p class="text-slate-400 mt-2">{{ 'HOME.NEW_ARRIVALS_SUBTITLE' | translate }}</p>
          </div>
          <a routerLink="/products" [queryParams]="{sort_by: 'newest'}"
             class="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 bg-white hover:bg-primary-50 border border-slate-200 hover:border-primary-200 px-5 py-2.5 rounded-xl transition-all duration-300 group">
            {{ 'HOME.VIEW_ALL' | translate }}
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        @if (loadingNewArrivals()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div class="relative aspect-square bg-slate-100 overflow-hidden">
                  <div class="absolute inset-0 nx-shimmer"></div>
                </div>
                <div class="p-5 space-y-3">
                  <div class="h-3 bg-slate-100 rounded-full w-1/3 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="h-4 bg-slate-100 rounded-full w-4/5 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="h-3 bg-slate-100 rounded-full w-1/4 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  <div class="pt-2">
                    <div class="h-5 bg-slate-100 rounded-full w-2/5 overflow-hidden relative"><div class="absolute inset-0 nx-shimmer"></div></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (product of newArrivals(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>
        }

        <!-- Mobile view all -->
        <div class="mt-8 text-center md:hidden">
          <a routerLink="/products" [queryParams]="{sort_by: 'newest'}"
             class="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 bg-white border border-slate-200 px-6 py-3 rounded-xl transition-colors hover:bg-primary-50">
            {{ 'HOME.VIEW_ALL' | translate }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- ========== NEWSLETTER ========== -->
    <section class="relative pt-20 pb-16 lg:pt-28 lg:pb-20 bg-slate-900 overflow-hidden">
      <!-- Top shape divider -->
      <div class="absolute -top-px left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg class="relative block w-full h-[40px] md:h-[70px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="#f9fafb"/>
        </svg>
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-4xl mx-auto">
          <div class="bg-gradient-to-br from-primary-600/20 to-accent-500/10 rounded-3xl border border-white/[0.06] p-8 md:p-14">
            <div class="flex flex-col md:flex-row items-center gap-10">
              <!-- Left: text -->
              <div class="flex-1 text-center md:text-left">
                <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">{{ 'HOME.NEWSLETTER_TITLE' | translate }}</h2>
                <p class="text-slate-400 leading-relaxed text-sm md:text-base">{{ 'HOME.NEWSLETTER_SUBTITLE' | translate }}</p>
              </div>
              <!-- Right: form -->
              <div class="w-full md:w-auto md:min-w-[340px] shrink-0">
                <form (submit)="subscribeNewsletter($event)" class="flex flex-col sm:flex-row gap-3">
                  <input type="email"
                         [(ngModel)]="newsletterEmail"
                         [placeholder]="'HOME.EMAIL_PLACEHOLDER' | translate"
                         class="flex-1 px-5 py-3.5 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white placeholder-slate-500 focus:outline-none focus:border-accent-400/50 focus:ring-1 focus:ring-accent-400/20 transition-all duration-300 text-sm"
                         required />
                  <button type="submit"
                          class="group bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/20 flex items-center justify-center gap-2 shrink-0 text-sm">
                    <span>{{ 'HOME.SUBSCRIBE' | translate }}</span>
                    <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </button>
                </form>
                <p class="text-xs text-slate-600 mt-3 text-center md:text-left">{{ 'HOME.NEWSLETTER_PRIVACY' | translate }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  categories = signal<Category[]>([]);
  featuredProducts = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  loadingFeatured = signal(true);
  loadingNewArrivals = signal(true);
  newsletterEmail = '';

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (res.success && res.data) this.categories.set(res.data); },
      error: () => {}
    });

    this.productService.getFeatured().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.success && res.data) this.featuredProducts.set(res.data);
        this.loadingFeatured.set(false);
      },
      error: () => this.loadingFeatured.set(false)
    });

    this.productService.getNewArrivals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.success && res.data) this.newArrivals.set(res.data);
        this.loadingNewArrivals.set(false);
      },
      error: () => this.loadingNewArrivals.set(false)
    });
  }

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (this.newsletterEmail.trim()) {
      this.toast.info(this.translate.instant('TOAST.NEWSLETTER_COMING_SOON'));
      this.newsletterEmail = '';
    }
  }
}
