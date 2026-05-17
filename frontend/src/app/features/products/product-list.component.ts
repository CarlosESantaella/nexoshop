import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, ProductFilters } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { PaginatedMeta } from '../../core/models/api-response.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ProductCardComponent],
  styles: [`
    @keyframes pl-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes pl-fade-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pl-slide-in {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
    :host { display: block; }
    .pl-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: pl-shimmer 1.8s ease-in-out infinite;
    }
    .pl-fade-in { animation: pl-fade-in 0.5s ease-out both; }
    .pl-fade-in-d1 { animation: pl-fade-in 0.5s ease-out 0.06s both; }
    .pl-fade-in-d2 { animation: pl-fade-in 0.5s ease-out 0.12s both; }
    .pl-slide-in { animation: pl-slide-in 0.4s ease-out both; }
  `],
  template: `
    <!-- ========== PAGE HEADER ========== -->
    <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-1/2 -translate-y-1/2 -right-20 w-[300px] h-[300px] rounded-full bg-primary-500/[0.07] blur-[80px] pointer-events-none"></div>
      <div class="absolute -bottom-10 left-1/4 w-[200px] h-[200px] rounded-full bg-accent-500/[0.05] blur-[60px] pointer-events-none"></div>
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(53,150,161,0.08),transparent_60%)] pointer-events-none"></div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-10 md:pb-16 relative z-10">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm mb-6 pl-fade-in">
          <a routerLink="/" class="text-slate-400 hover:text-white transition-colors duration-200">{{ 'COMMON.HOME' | translate }}</a>
          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          <span class="text-white/90 font-medium">{{ 'PRODUCTS.TITLE' | translate }}</span>
        </nav>

        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div class="pl-fade-in-d1">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight"
                style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, white, var(--color-primary-100), var(--color-accent-300));">
              {{ 'PRODUCTS.TITLE' | translate }}
            </h1>
            <p class="text-slate-400 mt-2 text-sm">
              {{ 'PRODUCTS.SHOWING' | translate }}
              <span class="text-white/80 font-semibold">{{ meta()?.total || 0 }}</span>
              {{ 'PRODUCTS.RESULTS' | translate }}
            </p>
          </div>

          <!-- Sort & view controls in header (desktop) -->
          <div class="pl-fade-in-d2 hidden sm:flex items-center gap-3">
            <select [(ngModel)]="sortBy" (change)="applyFilters()"
                    class="appearance-none pl-4 pr-9 py-2.5 bg-white/[0.08] border border-white/[0.12] text-white/90 text-sm rounded-xl
                           focus:outline-none focus:border-primary-400/40 focus:ring-1 focus:ring-primary-400/20 transition-all cursor-pointer
                           [&>option]:bg-slate-800 [&>option]:text-white"
                    style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E&quot;); background-position: right 0.75rem center; background-repeat: no-repeat; background-size: 1rem;">
              <option value="newest">{{ 'PRODUCTS.SORT_NEWEST' | translate }}</option>
              <option value="price_asc">{{ 'PRODUCTS.SORT_PRICE_ASC' | translate }}</option>
              <option value="price_desc">{{ 'PRODUCTS.SORT_PRICE_DESC' | translate }}</option>
              <option value="rating">{{ 'PRODUCTS.SORT_RATING' | translate }}</option>
              <option value="name">{{ 'PRODUCTS.SORT_NAME' | translate }}</option>
            </select>
            <div class="flex bg-white/[0.08] border border-white/[0.12] rounded-xl overflow-hidden">
              <button (click)="viewMode.set('grid')"
                      [class.bg-white/20]="viewMode() === 'grid'"
                      class="p-2.5 text-white/60 hover:text-white/90 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
                </svg>
              </button>
              <button (click)="viewMode.set('list')"
                      [class.bg-white/20]="viewMode() === 'list'"
                      class="p-2.5 text-white/60 hover:text-white/90 transition-all border-l border-white/[0.1]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Wave shape divider -->
      <div class="absolute -bottom-px left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" class="relative block w-full h-8 md:h-12">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f9fafb"/>
        </svg>
      </div>
    </section>

    <!-- ========== CONTENT ========== -->
    <div class="bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        <!-- Mobile filter FAB -->
        <button (click)="showFilters.set(!showFilters())"
                class="lg:hidden fixed bottom-24 right-6 z-40 bg-gradient-to-br from-slate-700 to-slate-800 text-white w-12 h-12 rounded-2xl
                       shadow-xl shadow-primary-600/30 hover:shadow-2xl hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-[transform,box-shadow]
                       flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/>
          </svg>
          @if (getActiveFilterCount() > 0) {
            <span class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {{ getActiveFilterCount() }}
            </span>
          }
        </button>

        <div class="flex gap-8">
          <!-- ========== SIDEBAR FILTERS ========== -->
          @if (showFilters()) {
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40" (click)="showFilters.set(false)"></div>
          }
          <aside class="hidden lg:block lg:w-72 lg:flex-shrink-0"
                 [class.hidden]="!showFilters()" [class.block]="showFilters()">
            <div class="lg:sticky lg:top-[152px] lg:max-h-[calc(100vh-168px)] lg:overflow-y-auto lg:scrollbar-thin"
                 [class.fixed]="showFilters()" [class.top-0]="showFilters()" [class.left-0]="showFilters()"
                 [class.h-full]="showFilters()" [class.w-80]="showFilters()" [class.z-50]="showFilters()"
                 [class.overflow-y-auto]="showFilters()" [class.bg-white]="showFilters()" [class.shadow-2xl]="showFilters()">
              <div class="bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-slate-100 overflow-hidden">

                <!-- Filter Header -->
                <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/>
                        </svg>
                      </div>
                      <h3 class="font-bold text-slate-800">{{ 'PRODUCTS.FILTERS' | translate }}</h3>
                      @if (getActiveFilterCount() > 0) {
                        <span class="min-w-[20px] h-5 px-1.5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {{ getActiveFilterCount() }}
                        </span>
                      }
                    </div>
                    <div class="flex items-center gap-2">
                      @if (getActiveFilterCount() > 0) {
                        <button (click)="clearFilters()" class="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
                          {{ 'PRODUCTS.CLEAR_FILTERS' | translate }}
                        </button>
                      }
                      <button (click)="showFilters.set(false)" class="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Categories Section -->
                <div class="border-b border-slate-100">
                  <button (click)="toggleSection('categories')"
                          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors">
                    <h4 class="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">{{ 'PRODUCTS.CATEGORIES' | translate }}</h4>
                    <svg class="w-4 h-4 text-slate-400 transition-transform duration-200"
                         [class.rotate-180]="filterSections['categories']"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  @if (filterSections['categories']) {
                    <div class="px-5 pb-5 space-y-0.5 pl-slide-in">
                      @for (cat of categories(); track cat.id) {
                        <label class="flex items-center gap-3 py-2 px-2.5 rounded-xl cursor-pointer transition-all duration-200 group"
                               [class.bg-primary-50/60]="isCategorySelected(cat.slug)"
                               [class.hover:bg-slate-50]="!isCategorySelected(cat.slug)">
                          <input type="checkbox" [checked]="isCategorySelected(cat.slug)" (change)="toggleCategory(cat.slug)"
                                 class="w-[18px] h-[18px] rounded-md border-2 border-slate-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-colors" />
                          <span class="text-sm flex-1 transition-colors"
                                [class.text-primary-700]="isCategorySelected(cat.slug)"
                                [class.font-medium]="isCategorySelected(cat.slug)"
                                [class.text-slate-600]="!isCategorySelected(cat.slug)">
                            {{ 'CAT.' + cat.slug | translate }}
                          </span>
                          <span class="text-[11px] tabular-nums px-2 py-0.5 rounded-md transition-colors"
                                [class.bg-primary-100]="isCategorySelected(cat.slug)"
                                [class.text-primary-600]="isCategorySelected(cat.slug)"
                                [class.bg-slate-100]="!isCategorySelected(cat.slug)"
                                [class.text-slate-400]="!isCategorySelected(cat.slug)">
                            {{ cat.products_count || 0 }}
                          </span>
                        </label>
                      }
                    </div>
                  }
                </div>

                <!-- Price Range Section -->
                <div class="border-b border-slate-100">
                  <button (click)="toggleSection('price')"
                          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors">
                    <h4 class="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">{{ 'PRODUCTS.PRICE_RANGE' | translate }}</h4>
                    <svg class="w-4 h-4 text-slate-400 transition-transform duration-200"
                         [class.rotate-180]="filterSections['price']"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  @if (filterSections['price']) {
                    <div class="px-6 pb-5 pl-slide-in">
                      <div class="flex items-center gap-3">
                        <div class="flex-1 relative">
                          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold pointer-events-none">$</span>
                          <input type="number" [(ngModel)]="minPrice" (ngModelChange)="onPriceChange()"
                                 [placeholder]="'PRODUCTS.MIN' | translate" min="0"
                                 class="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50
                                        focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div class="flex items-center gap-1 shrink-0">
                          <div class="w-2 h-px bg-slate-300"></div>
                          <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <div class="w-2 h-px bg-slate-300"></div>
                        </div>
                        <div class="flex-1 relative">
                          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold pointer-events-none">$</span>
                          <input type="number" [(ngModel)]="maxPrice" (ngModelChange)="onPriceChange()"
                                 [placeholder]="'PRODUCTS.MAX' | translate" min="0"
                                 class="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50
                                        focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Rating Section -->
                <div class="border-b border-slate-100">
                  <button (click)="toggleSection('rating')"
                          class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors">
                    <h4 class="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">{{ 'PRODUCTS.RATING' | translate }}</h4>
                    <svg class="w-4 h-4 text-slate-400 transition-transform duration-200"
                         [class.rotate-180]="filterSections['rating']"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  @if (filterSections['rating']) {
                    <div class="px-5 pb-5 space-y-1 pl-slide-in">
                      @for (rating of [4,3,2,1]; track rating) {
                        <button (click)="selectedRating = selectedRating === rating ? null : rating; applyFilters()"
                                class="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl transition-all duration-200 text-left"
                                [class.bg-amber-50/70]="selectedRating === rating"
                                [class.hover:bg-slate-50]="selectedRating !== rating">
                          <div class="flex items-center gap-0.5">
                            @for (s of [1,2,3,4,5]; track s) {
                              <svg class="w-[15px] h-[15px] transition-colors"
                                   [class.text-amber-400]="s <= rating"
                                   [class.text-slate-200]="s > rating"
                                   fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            }
                          </div>
                          <span class="text-xs text-slate-500">{{ 'PRODUCTS.AND_UP' | translate }}</span>
                          @if (selectedRating === rating) {
                            <svg class="w-3.5 h-3.5 text-amber-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                            </svg>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>

                <!-- In Stock Toggle -->
                <div class="px-6 py-5">
                  <label class="flex items-center justify-between cursor-pointer">
                    <div class="flex items-center gap-2.5">
                      <div class="w-2 h-2 rounded-full transition-colors"
                           [class.bg-green-400]="inStockOnly"
                           [class.bg-slate-300]="!inStockOnly"></div>
                      <span class="text-sm font-semibold text-slate-700">{{ 'PRODUCTS.IN_STOCK_ONLY' | translate }}</span>
                    </div>
                    <div class="relative inline-flex items-center">
                      <input type="checkbox" [(ngModel)]="inStockOnly" (change)="applyFilters()" class="sr-only peer" />
                      <div class="w-10 h-[22px] bg-slate-200 peer-checked:bg-primary-500 rounded-full transition-colors duration-200"></div>
                      <span class="absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-[18px]"></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          <!-- ========== MAIN CONTENT ========== -->
          <main class="flex-1 min-w-0">

            <!-- Mobile sort bar -->
            <div class="sm:hidden mb-4">
              <div class="flex items-center gap-2">
                <select [(ngModel)]="sortBy" (change)="applyFilters()"
                        class="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors">
                  <option value="newest">{{ 'PRODUCTS.SORT_NEWEST' | translate }}</option>
                  <option value="price_asc">{{ 'PRODUCTS.SORT_PRICE_ASC' | translate }}</option>
                  <option value="price_desc">{{ 'PRODUCTS.SORT_PRICE_DESC' | translate }}</option>
                  <option value="rating">{{ 'PRODUCTS.SORT_RATING' | translate }}</option>
                  <option value="name">{{ 'PRODUCTS.SORT_NAME' | translate }}</option>
                </select>
                <div class="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button (click)="viewMode.set('grid')"
                          [class.bg-primary-50]="viewMode() === 'grid'" [class.text-primary-600]="viewMode() === 'grid'"
                          class="p-2.5 text-slate-400 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
                    </svg>
                  </button>
                  <button (click)="viewMode.set('list')"
                          [class.bg-primary-50]="viewMode() === 'list'" [class.text-primary-600]="viewMode() === 'list'"
                          class="p-2.5 text-slate-400 transition-colors border-l border-slate-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Active filter chips -->
            @if (getActiveFilterCount() > 0) {
              <div class="flex items-center gap-2 flex-wrap mb-5 pl-fade-in">
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider mr-1">{{ 'PRODUCTS.FILTERS' | translate }}:</span>
                @if (filters().category) {
                  @for (catSlug of filters().category!.split(','); track catSlug) {
                    <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium border border-primary-100 transition-all hover:bg-primary-100">
                      {{ 'CAT.' + catSlug | translate }}
                      <button (click)="toggleCategory(catSlug)" class="w-4 h-4 rounded-full hover:bg-primary-200 flex items-center justify-center transition-colors">
                        <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </span>
                  }
                }
                @if (selectedRating) {
                  <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">
                    <svg class="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ selectedRating }}+ {{ 'PRODUCTS.AND_UP' | translate }}
                    <button (click)="selectedRating = null; applyFilters()" class="w-4 h-4 rounded-full hover:bg-amber-200 flex items-center justify-center transition-colors">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                }
                @if (minPrice || maxPrice) {
                  <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-medium border border-accent-100">
                    {{ '$' + (minPrice || 0) }} — {{ '$' + (maxPrice || '...') }}
                    <button (click)="minPrice = null; maxPrice = null; applyFilters()" class="w-4 h-4 rounded-full hover:bg-accent-200 flex items-center justify-center transition-colors">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                }
                @if (inStockOnly) {
                  <span class="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {{ 'PRODUCTS.IN_STOCK_ONLY' | translate }}
                    <button (click)="inStockOnly = false; applyFilters()" class="w-4 h-4 rounded-full hover:bg-green-200 flex items-center justify-center transition-colors">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                }
                <button (click)="clearFilters()" class="text-xs text-slate-400 hover:text-red-500 font-medium ml-1 transition-colors">
                  {{ 'PRODUCTS.CLEAR_FILTERS' | translate }}
                </button>
              </div>
            }

            <!-- Loading Skeletons -->
            @if (loading()) {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div class="relative aspect-square bg-slate-100 overflow-hidden">
                      <div class="absolute inset-0 pl-shimmer"></div>
                    </div>
                    <div class="p-5 space-y-3">
                      <div class="h-3 bg-slate-100 rounded-full w-1/3 overflow-hidden relative"><div class="absolute inset-0 pl-shimmer"></div></div>
                      <div class="h-4 bg-slate-100 rounded-full w-4/5 overflow-hidden relative"><div class="absolute inset-0 pl-shimmer"></div></div>
                      <div class="h-3 bg-slate-100 rounded-full w-1/4 overflow-hidden relative"><div class="absolute inset-0 pl-shimmer"></div></div>
                      <div class="pt-2">
                        <div class="h-5 bg-slate-100 rounded-full w-2/5 overflow-hidden relative"><div class="absolute inset-0 pl-shimmer"></div></div>
                      </div>
                    </div>
                  </div>
                }
              </div>

            <!-- Empty State -->
            } @else if (products().length === 0) {
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
                <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-2">{{ 'PRODUCTS.NO_RESULTS' | translate }}</h3>
                <p class="text-slate-400 text-sm mb-6 max-w-sm mx-auto">{{ 'PRODUCTS.TRY_DIFFERENT_FILTERS' | translate }}</p>
                <button (click)="clearFilters()"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  {{ 'PRODUCTS.CLEAR_FILTERS' | translate }}
                </button>
              </div>

            <!-- Product Grid -->
            } @else {
              <div [class]="viewMode() === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'">
                @for (product of products(); track product.id) {
                  <app-product-card [product]="product" [viewMode]="viewMode()" />
                }
              </div>
            }

            <!-- Pagination -->
            @if (meta() && meta()!.last_page > 1) {
              <div class="flex items-center justify-center gap-1.5 mt-12">
                <button (click)="goToPage(meta()!.current_page - 1)" [disabled]="meta()!.current_page === 1"
                        class="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500
                               hover:bg-white hover:border-slate-300 hover:text-slate-700
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                @for (page of getPageNumbers(); track page) {
                  <button (click)="goToPage(page)"
                          class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all"
                          [class.bg-gradient-to-br]="page === meta()!.current_page"
                          [class.from-primary-600]="page === meta()!.current_page"
                          [class.to-primary-700]="page === meta()!.current_page"
                          [class.text-white]="page === meta()!.current_page"
                          [class.shadow-md]="page === meta()!.current_page"
                          [class.shadow-primary-600/25]="page === meta()!.current_page"
                          [class.border]="page !== meta()!.current_page"
                          [class.border-slate-200]="page !== meta()!.current_page"
                          [class.text-slate-600]="page !== meta()!.current_page"
                          [class.hover:bg-white]="page !== meta()!.current_page"
                          [class.hover:border-slate-300]="page !== meta()!.current_page">
                    {{ page }}
                  </button>
                }
                <button (click)="goToPage(meta()!.current_page + 1)" [disabled]="meta()!.current_page === meta()!.last_page"
                        class="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500
                               hover:bg-white hover:border-slate-300 hover:text-slate-700
                               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            }
          </main>
        </div>
      </div>
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  meta = signal<PaginatedMeta | null>(null);
  loading = signal(true);
  showFilters = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  filters = signal<ProductFilters>({});

  sortBy = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedRating: number | null = null;
  private priceDebounce: any = null;
  inStockOnly = false;

  filterSections: Record<string, boolean> = {
    categories: true,
    price: true,
    rating: true
  };

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (res.success && res.data) this.categories.set(res.data); },
      error: () => {}
    });
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const filters: ProductFilters = {};
      if (params['category']) filters.category = params['category'];
      if (params['search']) filters.search = params['search'];
      if (params['sort_by']) { filters.sort_by = params['sort_by']; this.sortBy = params['sort_by']; }
      if (params['min_price']) { filters.min_price = +params['min_price']; this.minPrice = +params['min_price']; }
      if (params['max_price']) { filters.max_price = +params['max_price']; this.maxPrice = +params['max_price']; }
      if (params['in_stock']) { filters.in_stock = params['in_stock'] === 'true'; this.inStockOnly = filters.in_stock; }
      if (params['rating']) { filters.rating = +params['rating']; this.selectedRating = +params['rating']; }
      if (params['page']) filters.page = +params['page'];
      if (params['featured']) filters.featured = params['featured'] === 'true';
      this.filters.set(filters);
      this.loadProducts(filters);
    });
  }

  loadProducts(filters: ProductFilters): void {
    this.loading.set(true);
    this.productService.getProducts(filters).subscribe({
      next: (res: any) => {
        this.products.set(res.data?.data || res.data || []);
        if (res.data?.meta) this.meta.set(res.data.meta);
        else if (res.meta) this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    const queryParams: any = {};
    if (this.filters().category) queryParams.category = this.filters().category;
    if (this.sortBy !== 'newest') queryParams.sort_by = this.sortBy;
    if (this.minPrice) queryParams.min_price = this.minPrice;
    if (this.maxPrice) queryParams.max_price = this.maxPrice;
    if (this.inStockOnly) queryParams.in_stock = 'true';
    if (this.selectedRating) queryParams.rating = this.selectedRating;
    this.router.navigate(['/products'], { queryParams });
  }

  onPriceChange(): void {
    clearTimeout(this.priceDebounce);
    this.priceDebounce = setTimeout(() => this.applyFilters(), 600);
  }

  toggleCategory(slug: string): void {
    const current = this.filters().category || '';
    const selected = current ? current.split(',') : [];
    const index = selected.indexOf(slug);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(slug);
    }
    this.filters.set({ ...this.filters(), category: selected.length ? selected.join(',') : undefined });
    this.applyFilters();
  }

  isCategorySelected(slug: string): boolean {
    const category = this.filters().category || '';
    return category.split(',').includes(slug);
  }

  clearFilters(): void {
    this.minPrice = null; this.maxPrice = null; this.selectedRating = null;
    this.inStockOnly = false; this.sortBy = 'newest'; this.filters.set({});
    this.router.navigate(['/products']);
  }

  goToPage(page: number): void {
    if (!this.meta() || page < 1 || page > this.meta()!.last_page) return;
    this.router.navigate(['/products'], { queryParams: { ...this.route.snapshot.queryParams, page } });
  }

  getPageNumbers(): number[] {
    if (!this.meta()) return [];
    const total = this.meta()!.last_page;
    const current = this.meta()!.current_page;
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
    return pages;
  }

  toggleSection(section: string): void {
    this.filterSections[section] = !this.filterSections[section];
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.filters().category) count += this.filters().category!.split(',').length;
    if (this.minPrice || this.maxPrice) count++;
    if (this.selectedRating) count++;
    if (this.inStockOnly) count++;
    return count;
  }
}
