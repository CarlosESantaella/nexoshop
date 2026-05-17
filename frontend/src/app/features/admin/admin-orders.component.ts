import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CurrencyFormatPipe],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-slate-800 mb-6">{{ 'ADMIN.ORDERS' | translate }}</h1>
      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        @for (tab of statusTabs; track tab.value) {
          <button (click)="filterByStatus(tab.value)" [class.bg-primary-600]="activeStatus() === tab.value" [class.text-white]="activeStatus() === tab.value"
                  [class.bg-white]="activeStatus() !== tab.value" class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-primary-300 transition-colors whitespace-nowrap">{{ tab.label | translate }}</button>
        }
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.ORDER' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.CUSTOMER' | translate }}</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.DATE' | translate }}</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">{{ 'ADMIN.STATUS' | translate }}</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-600">{{ 'CART.TOTAL' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (order of orders(); track order.id) {
                <tr class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4 font-medium text-slate-800">{{ order.order_number }}</td>
                  <td class="py-3 px-4 text-gray-600">{{ order.shipping_first_name }} {{ order.shipping_last_name }}</td>
                  <td class="py-3 px-4 text-gray-500">{{ order.created_at | date:'shortDate' }}</td>
                  <td class="py-3 px-4 text-center">
                    <select [(ngModel)]="order.status" (change)="updateStatus(order.id, order.status)"
                            class="text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="pending">{{ 'ACCOUNT.PENDING' | translate }}</option>
                      <option value="processing">{{ 'ACCOUNT.PROCESSING' | translate }}</option>
                      <option value="shipped">{{ 'ACCOUNT.SHIPPED' | translate }}</option>
                      <option value="delivered">{{ 'ACCOUNT.DELIVERED' | translate }}</option>
                      <option value="cancelled">{{ 'ACCOUNT.CANCELLED' | translate }}</option>
                    </select>
                  </td>
                  <td class="py-3 px-4 text-right font-medium text-slate-800">{{ order.total | currencyFormat }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="py-10 text-center text-gray-400 text-sm">{{ 'ACCOUNT.NO_ORDERS' | translate }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      @if (meta()?.last_page > 1) {
        <div class="flex items-center justify-center gap-2 mt-6">
          <button (click)="loadOrders(meta()!.current_page - 1)" [disabled]="meta()!.current_page === 1" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">{{ 'COMMON.PREVIOUS' | translate }}</button>
          <span class="text-sm text-gray-500">{{ meta()!.current_page }} / {{ meta()!.last_page }}</span>
          <button (click)="loadOrders(meta()!.current_page + 1)" [disabled]="meta()!.current_page === meta()!.last_page" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">{{ 'COMMON.NEXT' | translate }}</button>
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  orders = signal<any[]>([]);
  meta = signal<any>(null);
  activeStatus = signal('');
  statusTabs = [
    { value: '', label: 'ACCOUNT.ALL' }, { value: 'pending', label: 'ACCOUNT.PENDING' },
    { value: 'processing', label: 'ACCOUNT.PROCESSING' }, { value: 'shipped', label: 'ACCOUNT.SHIPPED' },
    { value: 'delivered', label: 'ACCOUNT.DELIVERED' }, { value: 'cancelled', label: 'ACCOUNT.CANCELLED' },
  ];

  ngOnInit(): void { this.loadOrders(); }

  filterByStatus(status: string): void { this.activeStatus.set(status); this.loadOrders(); }

  loadOrders(page = 1): void {
    this.adminService.getOrders(page, this.activeStatus() || undefined).subscribe({
      next: (res: any) => { this.orders.set(res.data?.data || res.data || []); this.meta.set(res.data?.meta || res.meta || null); },
      error: () => this.toast.error(this.translate.instant('TOAST.FAILED_LOAD_ADMIN_ORDERS'))
    });
  }

  updateStatus(id: number, status: string): void {
    this.adminService.updateOrderStatus(id, status).subscribe({
      next: () => this.toast.success(this.translate.instant('TOAST.ORDER_STATUS_UPDATED')),
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_UPDATE_STATUS')); this.loadOrders(this.meta()?.current_page || 1); }
    });
  }
}
