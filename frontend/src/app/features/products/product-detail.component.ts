import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ReviewService } from '../../core/services/review.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Product } from '../../core/models/product.model';
import { Review, ReviewStats } from '../../core/models/review.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ProductCardComponent, StarRatingComponent, CurrencyFormatPipe],
  styles: [`
    @keyframes pd-fade-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pd-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    :host { display: block; }
    .pd-fade-in { animation: pd-fade-in 0.5s ease-out both; }
    .pd-fade-in-d1 { animation: pd-fade-in 0.5s ease-out 0.08s both; }
    .pd-fade-in-d2 { animation: pd-fade-in 0.5s ease-out 0.16s both; }
    .pd-fade-in-d3 { animation: pd-fade-in 0.5s ease-out 0.24s both; }
    .pd-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: pd-shimmer 1.8s ease-in-out infinite;
    }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
    .scrollbar-none::-webkit-scrollbar { display: none; }
  `],
  template: `
    <!-- ========== LOADING SKELETON ========== -->
    @if (loading()) {
      <div class="bg-gray-50 min-h-screen">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="h-4 bg-slate-200 rounded-full w-64 mb-8 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div class="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
            <div class="space-y-4 py-4">
              <div class="h-3 bg-slate-200 rounded-full w-24 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
              <div class="h-8 bg-slate-200 rounded-full w-4/5 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
              <div class="h-4 bg-slate-200 rounded-full w-40 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
              <div class="h-10 bg-slate-200 rounded-full w-1/3 mt-4 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
              <div class="h-20 bg-slate-200 rounded-xl w-full mt-4 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
              <div class="h-12 bg-slate-200 rounded-xl w-full mt-6 overflow-hidden relative"><div class="absolute inset-0 pd-shimmer"></div></div>
            </div>
          </div>
        </div>
      </div>

    <!-- ========== PRODUCT DETAIL ========== -->
    } @else if (product()) {
      <div class="bg-gray-50 min-h-screen">

        <!-- Breadcrumb -->
        <div class="bg-white border-b border-slate-100">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
            <nav class="flex items-center gap-2 text-sm text-slate-400 pd-fade-in">
              <a routerLink="/" class="hover:text-primary-600 transition-colors">{{ 'COMMON.HOME' | translate }}</a>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <a routerLink="/products" class="hover:text-primary-600 transition-colors">{{ 'PRODUCTS.TITLE' | translate }}</a>
              @if (product()!.category) {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <a [routerLink]="['/products']" [queryParams]="{category: product()!.category!.slug}" class="hover:text-primary-600 transition-colors">{{ product()!.category!.name }}</a>
              }
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span class="text-slate-700 font-medium truncate max-w-[200px]">{{ product()!.name }}</span>
            </nav>
          </div>
        </div>

        <!-- ===== PRODUCT HERO ===== -->
        <section class="bg-white">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

              <!-- Image Gallery -->
              <div class="pd-fade-in">
                <div class="relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-4 group">
                  <div class="aspect-square flex items-center justify-center p-6">
                    <img [src]="selectedImage() || product()!.primary_image || '/assets/images/placeholder.png'"
                         [alt]="product()!.name"
                         class="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  @if (product()!.is_on_sale && product()!.discount_percent > 0) {
                    <div class="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/25">
                      -{{ product()!.discount_percent }}%
                    </div>
                  }
                </div>
                @if (product()!.images && product()!.images!.length > 1) {
                  <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    @for (img of product()!.images; track img.id) {
                      <button (click)="selectedImage.set(img.image_path)"
                              class="w-20 h-20 shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200"
                              [class.border-primary-500]="selectedImage() === img.image_path"
                              [class.shadow-md]="selectedImage() === img.image_path"
                              [class.shadow-primary-500/20]="selectedImage() === img.image_path"
                              [class.border-slate-200]="selectedImage() !== img.image_path"
                              [class.hover:border-slate-300]="selectedImage() !== img.image_path">
                        <img [src]="img.image_path" [alt]="img.alt_text || product()!.name" class="w-full h-full object-cover" />
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Product Info -->
              <div class="lg:py-2">
                @if (product()!.category) {
                  <a [routerLink]="['/products']" [queryParams]="{category: product()!.category!.slug}"
                     class="inline-flex items-center text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg
                            hover:bg-primary-100 transition-colors mb-4 pd-fade-in uppercase tracking-wider">
                    {{ product()!.category!.name }}
                  </a>
                }
                <h1 class="text-2xl md:text-3xl lg:text-[2rem] font-bold text-slate-800 leading-tight mb-4 pd-fade-in-d1">{{ product()!.name }}</h1>
                <div class="flex items-center gap-3 mb-5 pd-fade-in-d1">
                  <app-star-rating [rating]="product()!.average_rating" />
                  <button (click)="activeTab.set('reviews')" class="text-sm text-slate-400 hover:text-primary-600 transition-colors">
                    ({{ product()!.review_count }} {{ 'PRODUCT.REVIEWS' | translate }})
                  </button>
                  @if (product()!.sku) {
                    <span class="text-xs text-slate-300 ml-auto">SKU: {{ product()!.sku }}</span>
                  }
                </div>
                <div class="flex items-baseline gap-3 mb-6 pd-fade-in-d1">
                  <span class="text-3xl font-bold"
                        style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, var(--color-slate-800), var(--color-primary-700));">
                    {{ product()!.price | currencyFormat }}
                  </span>
                  @if (product()!.compare_price && product()!.compare_price! > product()!.price) {
                    <span class="text-lg text-slate-400 line-through">{{ product()!.compare_price | currencyFormat }}</span>
                    <span class="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      {{ 'PRODUCT_DETAIL.SAVE' | translate }} {{ product()!.discount_percent }}%
                    </span>
                  }
                </div>
                @if (product()!.short_description) {
                  <p class="text-slate-500 leading-relaxed mb-6 text-[15px] pd-fade-in-d2">{{ product()!.short_description }}</p>
                }
                <div class="h-px bg-slate-100 mb-6 pd-fade-in-d2"></div>
                <div class="flex items-center gap-2.5 mb-6 pd-fade-in-d2">
                  @if (product()!.stock > 0) {
                    <div class="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                    <span class="text-sm font-medium text-green-700">{{ 'PRODUCT.IN_STOCK' | translate }}</span>
                    <span class="text-xs text-slate-400">({{ product()!.stock }} {{ 'PRODUCTS.AVAILABLE' | translate }})</span>
                  } @else {
                    <div class="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                    <span class="text-sm font-medium text-red-600">{{ 'PRODUCT.OUT_OF_STOCK' | translate }}</span>
                  }
                </div>
                <div class="flex items-center gap-3 mb-3 pd-fade-in-d2">
                  <div class="inline-flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                    <button (click)="decrementQty()" [class.opacity-40]="quantity <= 1"
                            class="w-10 h-12 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/></svg>
                    </button>
                    <input type="number" [(ngModel)]="quantity" min="1" [max]="product()!.stock"
                           class="w-12 h-12 text-center border-x border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none tabular-nums" />
                    <button (click)="incrementQty()" [class.opacity-40]="product()!.stock <= 0 || quantity >= product()!.stock"
                            class="w-10 h-12 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                    </button>
                  </div>
                  <button (click)="addToCart()" [disabled]="product()!.stock <= 0 || addingToCart()"
                          class="group flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl font-semibold text-white text-[15px]
                                 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                                 transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg">
                    @if (addingToCart()) {
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                    }
                    {{ 'PRODUCT.ADD_TO_CART' | translate }}
                  </button>
                </div>
                <button (click)="toggleWishlist()"
                        class="w-full h-11 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-6 pd-fade-in-d3"
                        [class.bg-red-50]="isInWishlist()" [class.text-red-500]="isInWishlist()" [class.border]="true"
                        [class.border-red-200]="isInWishlist()" [class.border-slate-200]="!isInWishlist()"
                        [class.bg-slate-50]="!isInWishlist()" [class.text-slate-500]="!isInWishlist()"
                        [class.hover:bg-red-50]="!isInWishlist()" [class.hover:text-red-500]="!isInWishlist()" [class.hover:border-red-200]="!isInWishlist()">
                  <svg class="w-[18px] h-[18px]" [attr.fill]="isInWishlist() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                  </svg>
                  {{ (isInWishlist() ? 'PRODUCT.REMOVE_FROM_WISHLIST' : 'PRODUCT.ADD_TO_WISHLIST') | translate }}
                </button>
                <div class="grid grid-cols-3 gap-3 pd-fade-in-d3">
                  <div class="flex flex-col items-center text-center gap-2 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
                    <span class="text-[11px] font-medium text-slate-500 leading-tight">{{ 'HOME.TRUST_SHIPPING' | translate }}</span>
                  </div>
                  <div class="flex flex-col items-center text-center gap-2 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                    <span class="text-[11px] font-medium text-slate-500 leading-tight">{{ 'HOME.TRUST_SECURE' | translate }}</span>
                  </div>
                  <div class="flex flex-col items-center text-center gap-2 py-3 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                    <span class="text-[11px] font-medium text-slate-500 leading-tight">{{ 'HOME.TRUST_DELIVERY' | translate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== TABS SECTION ===== -->
        <section class="bg-gray-50 border-t border-slate-100">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div class="flex gap-2 mb-8">
              <button (click)="activeTab.set('description')"
                      class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                      [class.bg-slate-800]="activeTab() === 'description'" [class.text-white]="activeTab() === 'description'" [class.shadow-md]="activeTab() === 'description'"
                      [class.bg-white]="activeTab() !== 'description'" [class.text-slate-500]="activeTab() !== 'description'"
                      [class.border]="activeTab() !== 'description'" [class.border-slate-200]="activeTab() !== 'description'"
                      [class.hover:bg-slate-50]="activeTab() !== 'description'">
                {{ 'PRODUCT.DESCRIPTION' | translate }}
              </button>
              <button (click)="activeTab.set('reviews')"
                      class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                      [class.bg-slate-800]="activeTab() === 'reviews'" [class.text-white]="activeTab() === 'reviews'" [class.shadow-md]="activeTab() === 'reviews'"
                      [class.bg-white]="activeTab() !== 'reviews'" [class.text-slate-500]="activeTab() !== 'reviews'"
                      [class.border]="activeTab() !== 'reviews'" [class.border-slate-200]="activeTab() !== 'reviews'"
                      [class.hover:bg-slate-50]="activeTab() !== 'reviews'">
                {{ 'PRODUCT.REVIEWS' | translate }} ({{ product()!.review_count }})
              </button>
            </div>
            @if (activeTab() === 'description') {
              <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 lg:p-10">
                <div class="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">{{ product()!.description }}</div>
              </div>
            }
            @if (activeTab() === 'reviews') {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:sticky lg:top-[152px] self-start">
                  <div class="text-center mb-6">
                    <div class="text-5xl font-bold mb-2"
                         style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, var(--color-slate-800), var(--color-primary-600));">
                      {{ product()!.average_rating.toFixed(1) }}
                    </div>
                    <app-star-rating [rating]="product()!.average_rating" [size]="'lg'" />
                    <p class="text-sm text-slate-400 mt-2.5">{{ product()!.review_count }} {{ 'PRODUCT.TOTAL_REVIEWS' | translate }}</p>
                  </div>
                  <div class="space-y-2.5">
                    @for (star of [5,4,3,2,1]; track star) {
                      <div class="flex items-center gap-2.5">
                        <span class="text-xs font-medium text-slate-500 w-3 tabular-nums">{{ star }}</span>
                        <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-amber-400 rounded-full transition-all duration-500" [style.width.%]="reviewStats()?.breakdown?.[star]?.percentage || 0"></div>
                        </div>
                        <span class="text-xs text-slate-400 w-6 text-right tabular-nums">{{ reviewStats()?.breakdown?.[star]?.count || 0 }}</span>
                      </div>
                    }
                  </div>
                </div>
                <div class="lg:col-span-2 space-y-4">
                  @if (authService.isLoggedIn()) {
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <h3 class="text-base font-bold text-slate-800 mb-5">{{ 'PRODUCT.WRITE_REVIEW' | translate }}</h3>
                      <form (submit)="submitReview($event)">
                        <div class="mb-5">
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{{ 'PRODUCT.YOUR_RATING' | translate }}</label>
                          <div class="flex gap-1.5">
                            @for (star of [1,2,3,4,5]; track star) {
                              <button type="button" (click)="reviewRating = star"
                                      class="w-9 h-9 flex items-center justify-center rounded-lg transition-all text-xl"
                                      [class.bg-amber-50]="star <= reviewRating" [class.text-amber-400]="star <= reviewRating"
                                      [class.text-slate-300]="star > reviewRating" [class.hover:text-amber-300]="star > reviewRating">
                                &#9733;
                              </button>
                            }
                          </div>
                        </div>
                        <div class="mb-4">
                          <input type="text" [(ngModel)]="reviewTitle" name="title" [placeholder]="'PRODUCT.REVIEW_TITLE' | translate"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50
                                        focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div class="mb-5">
                          <textarea [(ngModel)]="reviewComment" name="comment" rows="4" [placeholder]="'PRODUCT.REVIEW_COMMENT' | translate"
                                    class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none bg-slate-50/50
                                           focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"></textarea>
                        </div>
                        <button type="submit" [disabled]="reviewRating === 0"
                                class="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          {{ 'PRODUCT.SUBMIT_REVIEW' | translate }}
                        </button>
                      </form>
                    </div>
                  }
                  @for (review of reviews(); track review.id) {
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                      <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {{ review.user.name.charAt(0) }}
                          </div>
                          <div>
                            <div class="flex items-center gap-2.5">
                              <span class="font-semibold text-slate-800 text-sm">{{ review.user.name }}</span>
                              <app-star-rating [rating]="review.rating" [size]="'sm'" />
                            </div>
                            @if (review.title) { <h4 class="text-sm font-medium text-slate-600 mt-0.5">{{ review.title }}</h4> }
                          </div>
                        </div>
                        <span class="text-[11px] text-slate-400 shrink-0">{{ review.created_at | date:'mediumDate' }}</span>
                      </div>
                      @if (review.comment) {
                        <p class="text-slate-500 text-sm leading-relaxed ml-12">{{ review.comment }}</p>
                      }
                    </div>
                  }
                  @if (reviews().length === 0) {
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center">
                      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                        </svg>
                      </div>
                      <p class="text-slate-400 text-sm">{{ 'PRODUCT.NO_REVIEWS' | translate }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- ===== RELATED PRODUCTS ===== -->
        @if (relatedProducts().length > 0) {
          <section class="bg-white border-t border-slate-100">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
              <div class="flex items-center gap-3 mb-3">
                <span class="w-10 h-[3px] rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></span>
              </div>
              <h2 class="text-2xl md:text-3xl font-bold text-slate-800 mb-8">{{ 'PRODUCT.RELATED_PRODUCTS' | translate }}</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                @for (p of relatedProducts(); track p.id) { <app-product-card [product]="p" /> }
              </div>
            </div>
          </section>
        }
      </div>
    }
  `,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private reviewService = inject(ReviewService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  authService = inject(AuthService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  reviews = signal<Review[]>([]);
  reviewStats = signal<ReviewStats | null>(null);
  loading = signal(true);
  addingToCart = signal(false);
  activeTab = signal<'description' | 'reviews'>('description');
  selectedImage = signal<string | null>(null);
  quantity = 1;
  reviewRating = 0;
  reviewTitle = '';
  reviewComment = '';

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['slug']) this.loadProduct(params['slug']);
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getProduct(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.product.set(res.data);
          this.selectedImage.set(res.data.primary_image || null);
          this.loadRelated(slug);
          this.loadReviews(slug);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRelated(slug: string): void {
    this.productService.getRelated(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (res.success && res.data) this.relatedProducts.set(res.data); },
      error: () => {}
    });
  }

  loadReviews(slug: string): void {
    this.reviewService.getReviews(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.reviews.set(res.data.reviews || res.data.data || []);
          if (res.data.stats) this.reviewStats.set(res.data.stats);
        }
      },
      error: () => {}
    });
  }

  incrementQty(): void { if (this.product() && this.quantity < this.product()!.stock) this.quantity++; }
  decrementQty(): void { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    if (!this.product()) return;
    this.addingToCart.set(true);
    this.cartService.addItem(this.product()!.id, this.quantity).subscribe({
      next: res => { if (res.success) this.toast.success(this.translate.instant('TOAST.ADDED_TO_CART')); this.addingToCart.set(false); },
      error: () => { this.toast.error(this.translate.instant('COMMON.ERROR')); this.addingToCart.set(false); }
    });
  }

  toggleWishlist(): void {
    if (!this.product() || !this.authService.isLoggedIn()) return;
    this.wishlistService.toggle(this.product()!.id).subscribe({
      next: res => { if (res.success && res.data) this.toast.success(this.translate.instant(res.data.action === 'added' ? 'TOAST.ADDED_TO_WISHLIST' : 'TOAST.REMOVED_FROM_WISHLIST')); },
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR'))
    });
  }

  isInWishlist(): boolean { return this.product() ? this.wishlistService.isInWishlist(this.product()!.id) : false; }

  submitReview(event: Event): void {
    event.preventDefault();
    if (!this.product() || this.reviewRating === 0) return;
    this.reviewService.createReview(this.product()!.slug, { rating: this.reviewRating, title: this.reviewTitle || undefined, comment: this.reviewComment || undefined }).subscribe({
      next: res => {
        if (res.success) { this.toast.success(this.translate.instant('TOAST.REVIEW_SUBMITTED')); this.reviewRating = 0; this.reviewTitle = ''; this.reviewComment = ''; this.loadReviews(this.product()!.slug); }
      },
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR'))
    });
  }
}
