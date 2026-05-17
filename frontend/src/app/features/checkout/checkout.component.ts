import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { PaymentService } from '../../core/services/payment.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Address } from '../../core/models/address.model';
import { CouponValidation } from '../../core/models/coupon.model';
import { CreateOrderRequest } from '../../core/models/order.model';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, CurrencyFormatPipe],
  styles: [`
    @keyframes ck-fade-in {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host { display: block; }
    .ck-fade-in { animation: ck-fade-in 0.4s ease-out both; }
    .ck-fade-in-d1 { animation: ck-fade-in 0.4s ease-out 0.08s both; }
  `],
  template: `
    <div class="bg-gray-50 min-h-screen">

      <!-- ========== HEADER ========== -->
      <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div class="absolute top-1/2 -translate-y-1/2 -right-20 w-[250px] h-[250px] rounded-full bg-primary-500/[0.06] blur-[80px] pointer-events-none"></div>
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-10 md:pb-16 relative z-10">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight mb-8"
              style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, white, var(--color-primary-100), var(--color-accent-300));">
            {{ 'CHECKOUT.TITLE' | translate }}
          </h1>

          <!-- Steps -->
          <div class="flex items-center justify-center sm:justify-start gap-0">
            @for (step of steps; track step.num; let i = $index) {
              <div class="flex items-center">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                       [class.bg-accent-500]="currentStep() > step.num"
                       [class.text-white]="currentStep() >= step.num"
                       [class.bg-white/15]="currentStep() === step.num"
                       [class.border]="currentStep() === step.num" [class.border-white/30]="currentStep() === step.num"
                       [class.bg-white/[0.06]]="currentStep() < step.num" [class.text-white/30]="currentStep() < step.num">
                    @if (currentStep() > step.num) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    } @else { {{ step.num }} }
                  </div>
                  <span class="hidden sm:block text-xs font-semibold uppercase tracking-wider transition-colors"
                        [class.text-white/90]="currentStep() >= step.num"
                        [class.text-white/30]="currentStep() < step.num">
                    {{ step.label | translate }}
                  </span>
                </div>
                @if (i < steps.length - 1) {
                  <div class="w-8 sm:w-16 h-px mx-3 transition-colors duration-300"
                       [class.bg-accent-500]="currentStep() > step.num"
                       [class.bg-white/10]="currentStep() <= step.num"></div>
                }
              </div>
            }
          </div>
        </div>
        <div class="absolute -bottom-px left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" class="relative block w-full h-8 md:h-12">
            <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      <!-- ========== CONTENT ========== -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div class="flex flex-col lg:flex-row gap-8">

          <!-- ===== LEFT: FORM STEPS ===== -->
          <div class="flex-1 min-w-0">

            <!-- STEP 1: SHIPPING -->
            @if (currentStep() === 1) {
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ck-fade-in">
                <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    </div>
                    <h2 class="font-bold text-slate-800">{{ 'CHECKOUT.SHIPPING_ADDRESS' | translate }}</h2>
                  </div>
                </div>

                <div class="p-6">
                  <!-- Saved addresses -->
                  @if (addresses().length > 0) {
                    <div class="mb-6">
                      <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{{ 'CHECKOUT.SAVED_ADDRESSES' | translate }}</h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        @for (addr of addresses(); track addr.id) {
                          <label class="relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200"
                                 [class.border-primary-500]="selectedAddressId() === addr.id"
                                 [class.bg-primary-50/40]="selectedAddressId() === addr.id"
                                 [class.shadow-md]="selectedAddressId() === addr.id"
                                 [class.shadow-primary-500/10]="selectedAddressId() === addr.id"
                                 [class.border-slate-200]="selectedAddressId() !== addr.id"
                                 [class.hover:border-slate-300]="selectedAddressId() !== addr.id">
                            <input type="radio" name="address" [value]="addr.id" (change)="selectAddress(addr)" class="sr-only" />
                            @if (selectedAddressId() === addr.id) {
                              <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                              </div>
                            }
                            <p class="font-semibold text-slate-800 text-sm pr-6">{{ addr.first_name }} {{ addr.last_name }}</p>
                            <p class="text-sm text-slate-500 mt-1">{{ addr.address_line_1 }}</p>
                            <p class="text-sm text-slate-500">{{ addr.city }}, {{ addr.state }} {{ addr.postal_code }}</p>
                            @if (addr.is_default) {
                              <span class="inline-flex items-center mt-2 text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{{ 'CHECKOUT.DEFAULT' | translate }}</span>
                            }
                          </label>
                        }
                      </div>
                    </div>
                    <div class="border-t border-slate-100 pt-5 mb-5">
                      <button (click)="showNewAddress.set(!showNewAddress())"
                              class="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        {{ 'CHECKOUT.NEW_ADDRESS' | translate }}
                      </button>
                    </div>
                  }

                  <!-- New address form -->
                  @if (showNewAddress() || addresses().length === 0) {
                    <form [formGroup]="shippingForm">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.FIRST_NAME' | translate }} *</label>
                          <input type="text" formControlName="first_name"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.LAST_NAME' | translate }} *</label>
                          <input type="text" formControlName="last_name"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div class="md:col-span-2">
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.ADDRESS' | translate }} *</label>
                          <input type="text" formControlName="address_line_1"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.CITY' | translate }} *</label>
                          <input type="text" formControlName="city"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.STATE' | translate }} *</label>
                          <input type="text" formControlName="state"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.POSTAL_CODE' | translate }} *</label>
                          <input type="text" formControlName="postal_code"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.COUNTRY' | translate }}</label>
                          <input type="text" formControlName="country"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.PHONE' | translate }}</label>
                          <input type="tel" formControlName="phone"
                                 class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                                        focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors" />
                        </div>
                      </div>
                    </form>
                  }

                  <!-- Notes -->
                  <div class="mt-6">
                    <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ 'CHECKOUT.ORDER_NOTES' | translate }}</label>
                    <textarea [(ngModel)]="orderNotes" rows="3" [placeholder]="'CHECKOUT.NOTES_PLACEHOLDER' | translate"
                              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none bg-white
                                     focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-colors"></textarea>
                  </div>

                  <!-- Continue -->
                  <button (click)="goToPayment()" [disabled]="!isShippingValid()"
                          class="group w-full md:w-auto mt-6 flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-semibold text-white text-[15px]
                                 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                                 transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg">
                    {{ 'CHECKOUT.CONTINUE_PAYMENT' | translate }}
                    <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </button>
                </div>
              </div>
            }

            <!-- STEP 2: PAYMENT -->
            @if (currentStep() === 2) {
              <div class="space-y-5 ck-fade-in">
                <!-- Shipping summary -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ 'CHECKOUT.SHIPPING_TO' | translate }}</p>
                        <p class="text-sm font-medium text-slate-800">{{ shippingForm.value.first_name }} {{ shippingForm.value.last_name }} — {{ shippingForm.value.address_line_1 }}, {{ shippingForm.value.city }}</p>
                      </div>
                    </div>
                    <button (click)="currentStep.set(1)" class="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                      {{ 'COMMON.EDIT' | translate }}
                    </button>
                  </div>
                </div>

                <!-- Payment methods -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                        <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>
                      </div>
                      <h2 class="font-bold text-slate-800">{{ 'CHECKOUT.PAYMENT_METHOD' | translate }}</h2>
                    </div>
                  </div>

                  <div class="p-6 space-y-3">
                    <!-- MercadoPago -->
                    <label class="flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200"
                           [class.border-primary-500]="paymentMethod() === 'mercadopago'"
                           [class.bg-primary-50/40]="paymentMethod() === 'mercadopago'"
                           [class.shadow-md]="paymentMethod() === 'mercadopago'"
                           [class.shadow-primary-500/10]="paymentMethod() === 'mercadopago'"
                           [class.border-slate-200]="paymentMethod() !== 'mercadopago'"
                           [class.hover:border-slate-300]="paymentMethod() !== 'mercadopago'">
                      <input type="radio" name="payment" value="mercadopago" (change)="paymentMethod.set('mercadopago')" [checked]="paymentMethod() === 'mercadopago'"
                             class="w-[18px] h-[18px] text-primary-600 border-2 border-slate-300 focus:ring-primary-500 focus:ring-offset-0" />
                      <div class="flex-1">
                        <p class="font-semibold text-slate-800 text-sm">MercadoPago</p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ 'CHECKOUT.MERCADOPAGO_DESC' | translate }}</p>
                      </div>
                      <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>
                      </div>
                    </label>

                    <!-- Cash on delivery -->
                    <label class="flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200"
                           [class.border-primary-500]="paymentMethod() === 'cash_on_delivery'"
                           [class.bg-primary-50/40]="paymentMethod() === 'cash_on_delivery'"
                           [class.shadow-md]="paymentMethod() === 'cash_on_delivery'"
                           [class.shadow-primary-500/10]="paymentMethod() === 'cash_on_delivery'"
                           [class.border-slate-200]="paymentMethod() !== 'cash_on_delivery'"
                           [class.hover:border-slate-300]="paymentMethod() !== 'cash_on_delivery'">
                      <input type="radio" name="payment" value="cash_on_delivery" (change)="paymentMethod.set('cash_on_delivery')" [checked]="paymentMethod() === 'cash_on_delivery'"
                             class="w-[18px] h-[18px] text-primary-600 border-2 border-slate-300 focus:ring-primary-500 focus:ring-offset-0" />
                      <div class="flex-1">
                        <p class="font-semibold text-slate-800 text-sm">{{ 'CHECKOUT.CASH_ON_DELIVERY' | translate }}</p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ 'CHECKOUT.COD_DESC' | translate }}</p>
                      </div>
                      <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>
                      </div>
                    </label>
                  </div>

                  <!-- Actions -->
                  <div class="px-6 pb-6 flex gap-3">
                    <button (click)="currentStep.set(1)"
                            class="px-6 py-3 border border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm">
                      {{ 'COMMON.BACK' | translate }}
                    </button>
                    <button (click)="placeOrder()" [disabled]="placingOrder()"
                            class="group flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white text-[15px]
                                   bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800
                                   transition-all duration-300 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:shadow-primary-600/30
                                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg">
                      @if (placingOrder()) {
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      }
                      {{ 'CHECKOUT.PLACE_ORDER' | translate }}
                      @if (!placingOrder()) {
                        <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- ===== RIGHT: ORDER SUMMARY ===== -->
          <div class="lg:w-[380px] shrink-0">
            <div class="sticky top-[152px]">
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                      <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
                    </div>
                    <h3 class="font-bold text-slate-800">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }}</h3>
                  </div>
                </div>

                <div class="p-6">
                  <!-- Items -->
                  <div class="space-y-3 mb-6">
                    @for (item of cartService.cart()?.items || []; track item.id) {
                      <div class="flex items-center gap-3">
                        <div class="relative shrink-0">
                          <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                            <img [src]="item.product.primary_image || '/assets/images/placeholder.png'" class="w-full h-full object-cover" />
                          </div>
                          <span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-slate-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ item.quantity }}</span>
                        </div>
                        <p class="flex-1 text-sm font-medium text-slate-700 truncate min-w-0">{{ item.product.name }}</p>
                        <span class="text-sm font-semibold text-slate-800 tabular-nums shrink-0">{{ item.subtotal | currencyFormat }}</span>
                      </div>
                    }
                  </div>

                  <div class="h-px bg-slate-100 mb-5"></div>

                  <!-- Totals -->
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">{{ 'CART.SUBTOTAL' | translate }}</span>
                      <span class="font-semibold text-slate-700 tabular-nums">{{ cartService.subtotal() | currencyFormat }}</span>
                    </div>
                    @if (appliedCoupon()) {
                      <div class="flex justify-between items-center">
                        <span class="text-green-600 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/></svg>
                          {{ 'CART.DISCOUNT' | translate }}
                        </span>
                        <span class="font-semibold text-green-600 tabular-nums">-{{ appliedCoupon()!.discount | currencyFormat }}</span>
                      </div>
                    }
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">{{ 'CART.SHIPPING' | translate }}</span>
                      <span class="text-slate-500 tabular-nums">{{ shippingCost() === 0 ? ('CART.FREE' | translate) : (shippingCost() | currencyFormat) }}</span>
                    </div>
                  </div>

                  <!-- Total -->
                  <div class="mt-5 pt-5 border-t-2 border-slate-100">
                    <div class="flex justify-between items-baseline">
                      <span class="text-base font-bold text-slate-800">{{ 'CART.TOTAL' | translate }}</span>
                      <span class="text-2xl font-bold tabular-nums"
                            style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(135deg, var(--color-slate-800), var(--color-primary-700));">
                        {{ orderTotal() | currencyFormat }}
                      </span>
                    </div>
                  </div>

                  <!-- Trust -->
                  <div class="mt-5 pt-5 border-t border-slate-100">
                    <div class="flex items-center justify-center gap-5 text-slate-400">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                        <span class="text-[11px] font-medium">{{ 'HOME.TRUST_SECURE' | translate }}</span>
                      </div>
                      <div class="w-px h-3 bg-slate-200"></div>
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
                        <span class="text-[11px] font-medium">{{ 'HOME.TRUST_SHIPPING' | translate }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private paymentService = inject(PaymentService);
  private couponService = inject(CouponService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  cartService = inject(CartService);

  currentStep = signal(1);
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  showNewAddress = signal(false);
  paymentMethod = signal<string>('mercadopago');
  placingOrder = signal(false);
  orderNotes = '';
  couponCode = '';
  appliedCoupon = signal<CouponValidation | null>(null);

  shippingCost = computed(() => this.cartService.cart()?.shipping_cost ?? 0);
  orderTotal = computed(() => {
    const sub = this.cartService.subtotal();
    const discount = this.appliedCoupon()?.discount ?? 0;
    return Math.max(0, sub - discount + this.shippingCost());
  });

  steps = [
    { num: 1, label: 'CHECKOUT.STEP_SHIPPING' },
    { num: 2, label: 'CHECKOUT.STEP_PAYMENT' },
    { num: 3, label: 'CHECKOUT.STEP_CONFIRMATION' },
  ];

  shippingForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    address_line_1: ['', Validators.required], city: ['', Validators.required],
    state: ['', Validators.required], postal_code: ['', Validators.required],
    country: ['PE'], phone: [''],
  });

  ngOnInit(): void {
    this.addressService.getAddresses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.addresses.set(res.data);
          const def = res.data.find(a => a.is_default);
          if (def) this.selectAddress(def);
        }
      },
      error: () => {}
    });
  }

  selectAddress(addr: Address): void {
    this.selectedAddressId.set(addr.id);
    this.shippingForm.patchValue({ first_name: addr.first_name, last_name: addr.last_name, address_line_1: addr.address_line_1, city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country, phone: addr.phone || '' });
    this.showNewAddress.set(false);
  }

  isShippingValid(): boolean {
    if (this.showNewAddress() || this.addresses().length === 0) return this.shippingForm.valid;
    return this.selectedAddressId() !== null;
  }

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) return;
    this.couponService.validateCoupon(code, this.cartService.subtotal()).subscribe({
      next: res => { if (res.success && res.data) { this.appliedCoupon.set(res.data); this.toast.success(this.translate.instant('TOAST.COUPON_APPLIED')); } },
      error: () => this.toast.error(this.translate.instant('TOAST.COUPON_INVALID'))
    });
  }

  goToPayment(): void { if (!this.isShippingValid()) return; this.currentStep.set(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  placeOrder(): void {
    this.placingOrder.set(true);
    const f = this.shippingForm.value;
    const data: CreateOrderRequest = { first_name: f.first_name, last_name: f.last_name, address_line_1: f.address_line_1, city: f.city, state: f.state, postal_code: f.postal_code, country: f.country, phone: f.phone, notes: this.orderNotes || undefined, payment_method: this.paymentMethod(), coupon_code: this.appliedCoupon()?.coupon?.code || undefined };
    this.orderService.createOrder(data).subscribe({
      next: res => {
        if (res.success && res.data) {
          const order = res.data;
          if (this.paymentMethod() === 'mercadopago') {
            this.paymentService.createPreference(order.order_number).subscribe({
              next: payRes => {
                if (payRes.success && payRes.data?.init_point) {
                  try {
                    const url = new URL(payRes.data.init_point);
                    if (url.protocol === 'https:' || url.protocol === 'http:') { window.location.href = payRes.data.init_point; }
                    else { this.toast.error(this.translate.instant('TOAST.INVALID_PAYMENT_URL')); this.router.navigate(['/checkout/confirmation'], { queryParams: { order: order.order_number } }); }
                  } catch { this.toast.error(this.translate.instant('TOAST.INVALID_PAYMENT_URL')); this.router.navigate(['/checkout/confirmation'], { queryParams: { order: order.order_number } }); }
                } else { this.toast.error(this.translate.instant('TOAST.COULD_NOT_INIT_PAYMENT')); this.router.navigate(['/checkout/confirmation'], { queryParams: { order: order.order_number } }); }
              },
              error: () => { this.toast.error(this.translate.instant('TOAST.PAYMENT_INIT_FAILED')); this.placingOrder.set(false); }
            });
          } else { this.router.navigate(['/checkout/confirmation'], { queryParams: { order: order.order_number } }); }
        }
        this.placingOrder.set(false);
      },
      error: () => { this.toast.error(this.translate.instant('TOAST.FAILED_PLACE_ORDER')); this.placingOrder.set(false); }
    });
  }
}
