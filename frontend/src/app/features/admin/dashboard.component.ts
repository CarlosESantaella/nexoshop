import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyFormatPipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ 'ADMIN.DASHBOARD' | translate }}</h1>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-sm text-gray-500 mb-1">{{ 'ADMIN.TOTAL_REVENUE' | translate }}</p><p class="text-2xl font-bold text-slate-800">{{ (stats()?.revenue?.total ?? stats()?.revenue ?? 0) | currencyFormat }}</p></div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-sm text-gray-500 mb-1">{{ 'ADMIN.TOTAL_ORDERS' | translate }}</p><p class="text-2xl font-bold text-slate-800">{{ stats()?.orders?.total ?? stats()?.orders ?? 0 }}</p></div>
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"><svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-sm text-gray-500 mb-1">{{ 'ADMIN.TOTAL_CUSTOMERS' | translate }}</p><p class="text-2xl font-bold text-slate-800">{{ stats()?.customers || 0 }}</p></div>
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-sm text-gray-500 mb-1">{{ 'ADMIN.TOTAL_PRODUCTS' | translate }}</p><p class="text-2xl font-bold text-slate-800">{{ stats()?.products || 0 }}</p></div>
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>
          </div>
        </div>
      </div>
      <!-- Recent Orders -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold text-slate-800">{{ 'ADMIN.RECENT_ORDERS' | translate }}</h3><a routerLink="/admin/orders" class="text-primary-600 text-sm font-medium hover:text-primary-800">{{ 'HOME.VIEW_ALL' | translate }}</a></div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="text-left text-gray-500 border-b border-gray-200"><th class="pb-3 font-medium">{{ 'ADMIN.ORDER' | translate }}</th><th class="pb-3 font-medium">{{ 'ADMIN.CUSTOMER' | translate }}</th><th class="pb-3 font-medium">{{ 'ADMIN.STATUS' | translate }}</th><th class="pb-3 font-medium text-right">{{ 'CART.TOTAL' | translate }}</th></tr></thead>
              <tbody class="divide-y divide-gray-100">
                @for (order of stats()?.recent_orders || []; track order.id) {
                  <tr class="hover:bg-gray-50/50">
                    <td class="py-3 font-medium text-slate-800">{{ order.order_number }}</td>
                    <td class="py-3 text-gray-600">{{ order.user?.name || '-' }}</td>
                    <td class="py-3"><span class="text-xs font-medium px-2 py-0.5 rounded-full"
                          [class.bg-yellow-100]="order.status === 'pending'" [class.text-yellow-700]="order.status === 'pending'"
                          [class.bg-primary-100]="order.status === 'processing'" [class.text-primary-700]="order.status === 'processing'"
                          [class.bg-green-100]="order.status === 'delivered'" [class.text-green-700]="order.status === 'delivered'">{{ order.status }}</span></td>
                    <td class="py-3 text-right font-medium text-slate-800">{{ order.total | currencyFormat }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="py-10 text-center text-gray-400 text-sm">{{ 'ACCOUNT.NO_ORDERS' | translate }}</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        <!-- Low Stock -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ADMIN.LOW_STOCK' | translate }}</h3>
          <div class="space-y-3">
            @for (product of stats()?.low_stock || []; track product.id) {
              <div class="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></div>
                <div class="flex-1 min-w-0"><p class="text-sm font-medium text-slate-800 truncate">{{ product.name }}</p><p class="text-xs text-red-600">{{ product.stock }} {{ 'ADMIN.IN_STOCK' | translate }}</p></div>
              </div>
            } @empty {
              <p class="text-sm text-gray-400 text-center py-10">{{ 'ADMIN.NO_LOW_STOCK' | translate }}</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<any>(null);

  loadError = signal(false);

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: res => { if (res.success && res.data) this.stats.set(res.data); },
      error: () => this.loadError.set(true)
    });
  }
}
