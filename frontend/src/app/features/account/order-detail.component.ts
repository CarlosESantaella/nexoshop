import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { Order, OrderStatus } from '../../core/models/order.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, CurrencyFormatPipe],
  template: `
    @if (loading()) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"><div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div><div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div><div class="h-32 bg-gray-200 rounded"></div></div>
    } @else if (order()) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-bold text-slate-800">{{ 'ACCOUNT.ORDER' | translate }} #{{ order()!.order_number }}</h2>
                <span class="text-xs font-medium px-2.5 py-0.5 rounded-full"
                      [class.bg-yellow-100]="order()!.status === 'pending'" [class.text-yellow-700]="order()!.status === 'pending'"
                      [class.bg-primary-100]="order()!.status === 'processing'" [class.text-primary-700]="order()!.status === 'processing'"
                      [class.bg-purple-100]="order()!.status === 'shipped'" [class.text-purple-700]="order()!.status === 'shipped'"
                      [class.bg-green-100]="order()!.status === 'delivered'" [class.text-green-700]="order()!.status === 'delivered'"
                      [class.bg-red-100]="order()!.status === 'cancelled'" [class.text-red-700]="order()!.status === 'cancelled'">
                  {{ order()!.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ 'ACCOUNT.PLACED_ON' | translate }} {{ order()!.created_at | date:'fullDate' }}</p>
            </div>
            @if (order()!.status === 'pending') {
              <button (click)="cancelOrder()" class="border border-red-300 text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-lg text-sm transition-colors">{{ 'ACCOUNT.CANCEL_ORDER' | translate }}</button>
            }
          </div>
          <!-- Timeline -->
          <div class="flex items-center justify-between mb-2">
            @for (step of statusSteps; track step.status) {
              <div class="flex-1 flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1"
                     [class.bg-primary-600]="isStepCompleted(step.status)" [class.text-white]="isStepCompleted(step.status)"
                     [class.bg-gray-200]="!isStepCompleted(step.status)" [class.text-gray-400]="!isStepCompleted(step.status)">
                  @if (isStepCompleted(step.status)) { <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> }
                  @else { {{ step.num }} }
                </div>
                <span class="text-xs text-gray-500 text-center">{{ step.label | translate }}</span>
              </div>
            }
          </div>
        </div>
        <!-- Items -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'ACCOUNT.ORDER_ITEMS' | translate }}</h3>
          <div class="divide-y divide-gray-100">
            @for (item of order()!.items; track item.id) {
              <div class="flex items-center gap-4 py-4">
                @if (item.product_image) { <img [src]="item.product_image" class="w-16 h-16 rounded-lg object-cover border border-gray-100" /> }
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-800">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-500">{{ 'CART.QUANTITY' | translate }}: {{ item.quantity }} x {{ item.price | currencyFormat }}</p>
                </div>
                <span class="font-semibold text-slate-800">{{ item.total | currencyFormat }}</span>
              </div>
            }
          </div>
        </div>
        <!-- Shipping & Payment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">{{ 'ACCOUNT.SHIPPING_ADDRESS' | translate }}</h3>
            <p class="text-sm text-gray-600">{{ order()!.shipping_first_name }} {{ order()!.shipping_last_name }}</p>
            <p class="text-sm text-gray-600">{{ order()!.shipping_address_line_1 }}</p>
            <p class="text-sm text-gray-600">{{ order()!.shipping_city }}, {{ order()!.shipping_state }} {{ order()!.shipping_postal_code }}</p>
            <p class="text-sm text-gray-600">{{ order()!.shipping_country }}</p>
            @if (order()!.shipping_phone) { <p class="text-sm text-gray-600 mt-1">{{ order()!.shipping_phone }}</p> }
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-3">{{ 'ACCOUNT.PAYMENT_INFO' | translate }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ 'CHECKOUT.PAYMENT_METHOD' | translate }}: {{ order()!.payment_method }}</p>
            <p class="text-sm text-gray-600 mb-4">{{ 'ACCOUNT.PAYMENT_STATUS' | translate }}: <span class="font-medium">{{ order()!.payment_status }}</span></p>
            <div class="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div class="flex justify-between text-gray-600"><span>{{ 'CART.SUBTOTAL' | translate }}</span><span>{{ order()!.subtotal | currencyFormat }}</span></div>
              @if (order()!.discount_amount > 0) { <div class="flex justify-between text-green-600"><span>{{ 'CART.DISCOUNT' | translate }}</span><span>-{{ order()!.discount_amount | currencyFormat }}</span></div> }
              <div class="flex justify-between text-gray-600"><span>{{ 'CART.SHIPPING' | translate }}</span><span>{{ order()!.shipping_cost | currencyFormat }}</span></div>
              @if (order()!.tax_amount > 0) { <div class="flex justify-between text-gray-600"><span>{{ 'ACCOUNT.TAX' | translate }}</span><span>{{ order()!.tax_amount | currencyFormat }}</span></div> }
              <div class="flex justify-between text-lg font-bold text-slate-800 border-t border-gray-200 pt-2"><span>{{ 'CART.TOTAL' | translate }}</span><span>{{ order()!.total | currencyFormat }}</span></div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  order = signal<Order | null>(null);
  loading = signal(true);
  statusSteps = [
    { num: 1, status: 'pending' as OrderStatus, label: 'ACCOUNT.PENDING' },
    { num: 2, status: 'processing' as OrderStatus, label: 'ACCOUNT.PROCESSING' },
    { num: 3, status: 'shipped' as OrderStatus, label: 'ACCOUNT.SHIPPED' },
    { num: 4, status: 'delivered' as OrderStatus, label: 'ACCOUNT.DELIVERED' },
  ];
  private statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['orderNumber']) {
        this.orderService.getOrder(params['orderNumber']).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => { if (res.success && res.data) this.order.set(res.data); this.loading.set(false); },
          error: () => this.loading.set(false)
        });
      }
    });
  }

  isStepCompleted(status: OrderStatus): boolean {
    if (!this.order() || this.order()!.status === 'cancelled') return false;
    return this.statusOrder.indexOf(this.order()!.status) >= this.statusOrder.indexOf(status);
  }

  cancelOrder(): void {
    if (!this.order()) return;
    this.orderService.cancelOrder(this.order()!.order_number).subscribe({
      next: res => { if (res.success && res.data) { this.order.set(res.data); this.toast.success(this.translate.instant('TOAST.ORDER_CANCELLED')); } },
      error: () => this.toast.error(this.translate.instant('COMMON.ERROR'))
    });
  }
}
