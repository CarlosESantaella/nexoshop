import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, CurrencyFormatPipe],
  template: `
    <div class="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-2xl w-full text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-2">{{ 'CONFIRMATION.THANK_YOU' | translate }}</h1>
        <p class="text-gray-500 mb-6">{{ 'CONFIRMATION.EMAIL_SENT' | translate }}</p>
        @if (loadError()) {
          <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg p-4 mb-6">{{ 'CONFIRMATION.LOAD_ERROR' | translate }}</div>
        }
        @if (orderNumber) {
          <div class="bg-gray-50 rounded-xl p-6 mb-8 inline-block"><p class="text-sm text-gray-500 mb-1">{{ 'CONFIRMATION.ORDER_NUMBER' | translate }}</p><p class="text-2xl font-bold text-primary-600">{{ orderNumber }}</p></div>
        }
        @if (order()) {
          <div class="border-t border-gray-200 pt-6 mb-8 text-left">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">{{ 'CONFIRMATION.ORDER_DETAILS' | translate }}</h3>
            <div class="space-y-3">
              @for (item of order()!.items; track item.id) {
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-3">
                    @if (item.product_image) { <img [src]="item.product_image" class="w-10 h-10 rounded-lg object-cover border border-gray-100" /> }
                    <div><p class="font-medium text-slate-800">{{ item.product_name }}</p><p class="text-gray-400">x{{ item.quantity }}</p></div>
                  </div>
                  <span class="font-medium text-slate-800">{{ item.total | currencyFormat }}</span>
                </div>
              }
            </div>
            <div class="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div class="flex justify-between text-gray-600"><span>{{ 'CART.SUBTOTAL' | translate }}</span><span>{{ order()!.subtotal | currencyFormat }}</span></div>
              @if (order()!.discount_amount > 0) { <div class="flex justify-between text-green-600"><span>{{ 'CART.DISCOUNT' | translate }}</span><span>-{{ order()!.discount_amount | currencyFormat }}</span></div> }
              <div class="flex justify-between text-gray-600"><span>{{ 'CART.SHIPPING' | translate }}</span><span>{{ order()!.shipping_cost | currencyFormat }}</span></div>
              <div class="flex justify-between text-lg font-bold text-slate-800 border-t border-gray-200 pt-2"><span>{{ 'CART.TOTAL' | translate }}</span><span>{{ order()!.total | currencyFormat }}</span></div>
            </div>
          </div>
        }
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/" class="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">{{ 'CONFIRMATION.CONTINUE_SHOPPING' | translate }}</a>
          @if (orderNumber) { <a [routerLink]="['/account/orders', orderNumber]" class="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-primary-600 text-slate-800 font-semibold px-8 py-3 rounded-lg transition-colors">{{ 'CONFIRMATION.VIEW_ORDER' | translate }}</a> }
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private destroyRef = inject(DestroyRef);
  order = signal<Order | null>(null);
  orderNumber = '';
  loadError = signal(false);

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.orderNumber = params['order'] || '';
      if (this.orderNumber) {
        this.orderService.getOrder(this.orderNumber).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => { if (res.success && res.data) this.order.set(res.data); },
          error: () => this.loadError.set(true)
        });
      }
    });
  }
}
