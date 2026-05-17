import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, OrderStatus } from '../../core/models/order.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyFormatPipe],
  template: `
    <div>
      <!-- Status Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        @for (tab of statusTabs; track tab.value) {
          <button (click)="filterByStatus(tab.value)"
                  [class.bg-primary-600]="activeStatus() === tab.value" [class.text-white]="activeStatus() === tab.value"
                  [class.bg-white]="activeStatus() !== tab.value" [class.text-gray-600]="activeStatus() !== tab.value"
                  class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-primary-300 transition-colors whitespace-nowrap">
            {{ tab.label | translate }}
          </button>
        }
      </div>
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) { <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"><div class="h-5 bg-gray-200 rounded w-1/3 mb-3"></div><div class="h-4 bg-gray-200 rounded w-1/2"></div></div> }
        </div>
      } @else if (orders().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ 'ACCOUNT.NO_ORDERS' | translate }}</h3>
          <a routerLink="/products" class="text-primary-600 hover:text-primary-800 font-medium text-sm">{{ 'CART.START_SHOPPING' | translate }}</a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-semibold text-slate-800">{{ order.order_number }}</span>
                    <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                          [class.bg-yellow-100]="order.status === 'pending'" [class.text-yellow-700]="order.status === 'pending'"
                          [class.bg-primary-100]="order.status === 'processing'" [class.text-primary-700]="order.status === 'processing'"
                          [class.bg-purple-100]="order.status === 'shipped'" [class.text-purple-700]="order.status === 'shipped'"
                          [class.bg-green-100]="order.status === 'delivered'" [class.text-green-700]="order.status === 'delivered'"
                          [class.bg-red-100]="order.status === 'cancelled'" [class.text-red-700]="order.status === 'cancelled'">
                      {{ order.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">{{ order.created_at | date:'mediumDate' }} &bull; {{ order.items.length }} {{ 'ACCOUNT.ITEMS' | translate }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-lg font-bold text-slate-800">{{ order.total | currencyFormat }}</span>
                  <a [routerLink]="['/account/orders', order.order_number]" class="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors">{{ 'ACCOUNT.VIEW_DETAILS' | translate }}</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  activeStatus = signal<string>('');
  statusTabs = [
    { value: '', label: 'ACCOUNT.ALL' },
    { value: 'pending', label: 'ACCOUNT.PENDING' },
    { value: 'processing', label: 'ACCOUNT.PROCESSING' },
    { value: 'shipped', label: 'ACCOUNT.SHIPPED' },
    { value: 'delivered', label: 'ACCOUNT.DELIVERED' },
    { value: 'cancelled', label: 'ACCOUNT.CANCELLED' },
  ];

  private destroyRef = inject(DestroyRef);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  ngOnInit(): void { this.loadOrders(); }

  filterByStatus(status: string): void { this.activeStatus.set(status); this.loadOrders(); }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders(this.activeStatus() || undefined).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => { this.orders.set(res.data?.orders || res.data?.data || res.data || []); this.loading.set(false); },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_ORDERS')); this.loading.set(false); }
    });
  }
}
