import { Component, Input, inject, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink, TranslateModule, StarRatingComponent, CurrencyFormatPipe],
  template: `
    <!-- GRID VIEW -->
    <div *ngIf="viewMode !== 'list'"
      class="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200
             transition-[box-shadow,border-color] duration-300 overflow-hidden flex flex-col h-full">
      <div class="relative overflow-hidden aspect-square bg-slate-50">
        <a [routerLink]="['/products', product.slug]" class="block w-full h-full">
          <img *ngIf="product.primary_image" [src]="product.primary_image" [alt]="product.name"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          <div *ngIf="!product.primary_image" class="w-full h-full flex items-center justify-center bg-slate-100">
            <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
        </a>
        <div *ngIf="product.stock <= 0" class="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
          <span class="bg-white text-slate-800 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">{{ 'PRODUCTS.OUT_OF_STOCK' | translate }}</span>
        </div>
        <div *ngIf="product.is_on_sale && product.discount_percent > 0 && product.stock > 0"
          class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30">-{{ product.discount_percent }}%</div>
        <button (click)="toggleWishlist($event)"
          [ngClass]="isInWishlist() ? 'bg-red-50 text-red-500' : 'bg-white/90 text-slate-500 hover:text-red-500'"
          class="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-[opacity,transform] duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
          [class.opacity-100]="isInWishlist()">
          <svg class="w-5 h-5" [attr.fill]="isInWishlist() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
        <div *ngIf="product.stock > 0" class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button (click)="addToCart($event)" [disabled]="addingToCart()"
            class="w-full h-10 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <svg *ngIf="!addingToCart()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            <svg *ngIf="addingToCart()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ 'PRODUCTS.ADD_TO_CART' | translate }}
          </button>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <p *ngIf="product.category" class="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wider">{{ 'CAT.' + product.category.slug | translate }}</p>
        <a [routerLink]="['/products', product.slug]" class="text-sm font-semibold text-slate-800 hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-2 flex-grow">{{ product.name }}</a>
        <div class="flex items-center gap-1.5 mb-3">
          <app-star-rating [rating]="product.average_rating" [size]="'sm'" />
          <span *ngIf="product.review_count > 0" class="text-xs text-slate-400">({{ product.review_count }})</span>
        </div>
        <div class="flex items-end gap-2 mt-auto">
          <span class="text-lg font-bold text-slate-900">{{ product.price | currencyFormat }}</span>
          <span *ngIf="product.compare_price && product.is_on_sale" class="text-sm text-slate-400 line-through">{{ product.compare_price | currencyFormat }}</span>
        </div>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div *ngIf="viewMode === 'list'"
      class="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200
             transition-[box-shadow,border-color] duration-300 overflow-hidden flex flex-row">
      <!-- Image -->
      <a [routerLink]="['/products', product.slug]" class="relative shrink-0 w-48 h-48 bg-slate-50 overflow-hidden">
        <img *ngIf="product.primary_image" [src]="product.primary_image" [alt]="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div *ngIf="product.stock <= 0" class="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
          <span class="bg-white text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">{{ 'PRODUCTS.OUT_OF_STOCK' | translate }}</span>
        </div>
        <div *ngIf="product.is_on_sale && product.discount_percent > 0 && product.stock > 0"
          class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">-{{ product.discount_percent }}%</div>
      </a>
      <!-- Content -->
      <div class="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <p *ngIf="product.category" class="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wider">{{ 'CAT.' + product.category.slug | translate }}</p>
          <a [routerLink]="['/products', product.slug]" class="text-base font-semibold text-slate-800 hover:text-primary-600 transition-colors line-clamp-1 mb-1">{{ product.name }}</a>
          <p *ngIf="product.short_description" class="text-sm text-slate-500 line-clamp-2 mb-3">{{ product.short_description }}</p>
          <div class="flex items-center gap-1.5 mb-3">
            <app-star-rating [rating]="product.average_rating" [size]="'sm'" />
            <span *ngIf="product.review_count > 0" class="text-xs text-slate-400">({{ product.review_count }})</span>
          </div>
        </div>
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-end gap-2">
            <span class="text-xl font-bold text-slate-900">{{ product.price | currencyFormat }}</span>
            <span *ngIf="product.compare_price && product.is_on_sale" class="text-sm text-slate-400 line-through">{{ product.compare_price | currencyFormat }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="toggleWishlist($event)"
              [ngClass]="isInWishlist() ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 bg-slate-50'"
              class="w-9 h-9 rounded-full flex items-center justify-center transition-colors">
              <svg class="w-4 h-4" [attr.fill]="isInWishlist() ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>
            <button *ngIf="product.stock > 0" (click)="addToCart($event)" [disabled]="addingToCart()"
              class="h-9 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              {{ 'PRODUCTS.ADD_TO_CART' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private translateService = inject(TranslateService);
  private router = inject(Router);

  addingToCart = signal(false);

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product.id);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addingToCart.set(true);
    this.cartService.addItem(this.product.id).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toastService.success(this.translateService.instant('TOAST.ADDED_TO_CART'));
      },
      error: () => {
        this.addingToCart.set(false);
        this.toastService.error(this.translateService.instant('COMMON.ERROR'));
      }
    });
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.wishlistService.toggle(this.product.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const key = res.data.action === 'added' ? 'TOAST.ADDED_TO_WISHLIST' : 'TOAST.REMOVED_FROM_WISHLIST';
          this.toastService.success(this.translateService.instant(key));
        }
      },
      error: () => this.toastService.error(this.translateService.instant('COMMON.ERROR'))
    });
  }
}
