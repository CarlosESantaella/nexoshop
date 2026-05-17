import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ProductCardComponent],
  template: `
    <div>
      <h2 class="text-xl font-bold text-slate-800 mb-6">{{ 'ACCOUNT.WISHLIST' | translate }}</h2>
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1,2,3]; track i) { <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"><div class="h-48 bg-gray-200"></div><div class="p-4 space-y-3"><div class="h-4 bg-gray-200 rounded w-3/4"></div><div class="h-6 bg-gray-200 rounded w-1/3"></div></div></div> }
        </div>
      } @else if (products().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ 'ACCOUNT.WISHLIST_EMPTY' | translate }}</h3>
          <a routerLink="/products" class="text-primary-600 hover:text-primary-800 font-medium text-sm">{{ 'ACCOUNT.BROWSE_PRODUCTS' | translate }}</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of products(); track product.id) {
            <div class="relative group">
              <app-product-card [product]="product" />
              <button (click)="removeFromWishlist(product.id)"
                      class="absolute top-3 right-3 z-10 bg-white/90 hover:bg-red-50 border border-gray-200 hover:border-red-300 p-2 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  products = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.wishlistService.getWishlistProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => { if (res.success && res.data) this.products.set(res.data); this.loading.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_WISHLIST')); this.loading.set(false); }
    });
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.toggle(productId).subscribe({
      next: res => {
        if (res.success) { this.products.update(p => p.filter(item => item.id !== productId)); this.toast.success(this.translate.instant('TOAST.REMOVED_FROM_WISHLIST_SIMPLE')); }
      },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_REMOVE_ITEM'))
    });
  }
}
