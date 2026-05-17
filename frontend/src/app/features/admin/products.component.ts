import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-slate-800">{{ 'ADMIN.PRODUCTS' | translate }}</h1>
        <div class="flex items-center gap-3">
          <div class="relative"><input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" [placeholder]="'ADMIN.SEARCH_PRODUCTS' | translate"
               class="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64" />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <a routerLink="/admin/products/new" class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ 'ADMIN.ADD_PRODUCT' | translate }}
          </a>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.PRODUCT' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">SKU</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.CATEGORY' | translate }}</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-600">{{ 'CART.PRICE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.STOCK' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIVE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.FEATURED' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (product of products(); track product.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <img [src]="product.primary_image || '/assets/images/placeholder.png'" class="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      <span class="font-medium text-slate-800">{{ product.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-gray-500">{{ product.sku || '-' }}</td>
                  <td class="py-3 px-4 text-gray-500">{{ product.category?.name || '-' }}</td>
                  <td class="py-3 px-4 text-right font-medium text-slate-800">{{ product.price | currencyFormat }}</td>
                  <td class="py-3 px-4 text-center"><span [class.text-red-600]="product.stock <= 5" [class.font-semibold]="product.stock <= 5">{{ product.stock }}</span></td>
                  <td class="py-3 px-4 text-center">
                    <button (click)="toggleActive(product)" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" [class.bg-primary-600]="product.is_active" [class.bg-gray-300]="!product.is_active">
                      <span class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform" [class.translate-x-6]="product.is_active" [class.translate-x-1]="!product.is_active"></span>
                    </button>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button (click)="toggleFeatured(product)" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" [class.bg-amber-500]="product.is_featured" [class.bg-gray-300]="!product.is_featured">
                      <span class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform" [class.translate-x-6]="product.is_featured" [class.translate-x-1]="!product.is_featured"></span>
                    </button>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <a [routerLink]="['/admin/products', product.id, 'edit']" class="text-primary-600 hover:text-primary-800 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></a>
                      <button (click)="deleteProduct(product.id)" class="text-red-500 hover:text-red-700 p-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="py-10 text-center text-gray-400 text-sm">No hay productos registrados</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      @if (meta()?.last_page && meta()!.last_page > 1) {
        <div class="flex items-center justify-center gap-2 mt-6">
          <button (click)="loadProducts(meta()!.current_page - 1)" [disabled]="meta()!.current_page === 1" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">{{ 'COMMON.PREVIOUS' | translate }}</button>
          <span class="text-sm text-gray-500">{{ meta()!.current_page }} / {{ meta()!.last_page }}</span>
          <button (click)="loadProducts(meta()!.current_page + 1)" [disabled]="meta()!.current_page === meta()!.last_page" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">{{ 'COMMON.NEXT' | translate }}</button>
        </div>
      }
    </div>
  `,
})
export class ProductsComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  products = signal<any[]>([]);
  meta = signal<any>(null);
  searchQuery = '';
  private searchTimeout: any;

  ngOnInit(): void { this.loadProducts(); }

  ngOnDestroy(): void { clearTimeout(this.searchTimeout); }

  loadProducts(page = 1): void {
    this.adminService.getProducts(page, this.searchQuery || undefined).subscribe({
      next: (res: any) => { this.products.set(res.data?.data || res.data || []); this.meta.set(res.data?.meta || res.meta || null); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_PRODUCTS'))
    });
  }

  onSearch(): void { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => this.loadProducts(), 400); }

  toggleActive(product: any): void {
    this.adminService.toggleProductActive(product.id).subscribe({
      next: () => { product.is_active = !product.is_active; this.toast.success(this.translate.instant('TOAST.PRODUCT_UPDATED')); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_UPDATE_PRODUCT'))
    });
  }

  toggleFeatured(product: any): void {
    this.adminService.toggleProductFeatured(product.id).subscribe({
      next: () => { product.is_featured = !product.is_featured; this.toast.success(this.translate.instant('TOAST.PRODUCT_UPDATED')); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_UPDATE_PRODUCT'))
    });
  }

  deleteProduct(id: number): void {
    if (!confirm(this.translate.instant('TOAST.CONFIRM_DELETE_PRODUCT'))) return;
    this.adminService.deleteProduct(id).subscribe({
      next: () => { this.toast.success(this.translate.instant('TOAST.PRODUCT_DELETED')); this.loadProducts(); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_DELETE_PRODUCT'))
    });
  }
}
