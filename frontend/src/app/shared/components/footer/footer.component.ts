import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <footer class="bg-slate-900 text-slate-300">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          <!-- Brand Column -->
          <div class="lg:col-span-4">
            <a routerLink="/" class="inline-block mb-5">
              <img src="/assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-12 w-auto brightness-0 invert" />
            </a>
            <p class="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              {{ 'FOOTER.ABOUT_TEXT' | translate }}
            </p>
            <div class="flex items-center gap-2.5">
              <a href="#" class="w-9 h-9 bg-white/[0.05] hover:bg-primary-600 border border-white/[0.08] hover:border-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                <svg class="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="w-9 h-9 bg-white/[0.05] hover:bg-primary-600 border border-white/[0.08] hover:border-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                <svg class="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" class="w-9 h-9 bg-white/[0.05] hover:bg-primary-600 border border-white/[0.08] hover:border-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 group">
                <svg class="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="lg:col-span-2">
            <h4 class="text-xs font-semibold text-white uppercase tracking-widest mb-5">
              {{ 'FOOTER.QUICK_LINKS' | translate }}
            </h4>
            <ul class="space-y-3">
              <li><a routerLink="/" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.HOME' | translate }}</a></li>
              <li><a routerLink="/products" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.SHOP' | translate }}</a></li>
              <li><a routerLink="/products" [queryParams]="{ on_sale: true }" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.DEALS' | translate }}</a></li>
              <li><a routerLink="/products" [queryParams]="{ sort_by: 'newest' }" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.NEW_ARRIVALS' | translate }}</a></li>
            </ul>
          </div>

          <!-- Customer Service -->
          <div class="lg:col-span-3">
            <h4 class="text-xs font-semibold text-white uppercase tracking-widest mb-5">
              {{ 'FOOTER.CUSTOMER_SERVICE' | translate }}
            </h4>
            <ul class="space-y-3">
              <li><a routerLink="/account/profile" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.MY_ACCOUNT' | translate }}</a></li>
              <li><a routerLink="/account/orders" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'NAV.MY_ORDERS' | translate }}</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'FOOTER.FAQ' | translate }}</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'FOOTER.SHIPPING_INFO' | translate }}</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors duration-200">{{ 'FOOTER.RETURNS' | translate }}</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="lg:col-span-3">
            <h4 class="text-xs font-semibold text-white uppercase tracking-widest mb-5">
              {{ 'FOOTER.CONTACT' | translate }}
            </h4>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-primary-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-sm text-slate-400">Lima, Peru</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-primary-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="text-sm text-slate-400">soporte&#64;nexoshop.com</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-primary-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="text-sm text-slate-400">+51 (01) 234-5678</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Divider + Payment & Bottom -->
        <div class="mt-12 pt-8 border-t border-white/[0.06]">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <p class="text-xs text-slate-500 order-2 md:order-1">{{ 'FOOTER.COPYRIGHT' | translate }}</p>

            <!-- Payment Methods -->
            <div class="flex items-center gap-3 order-1 md:order-2">
              <span class="text-xs text-slate-600 mr-1">{{ 'FOOTER.PAYMENT_METHODS' | translate }}:</span>
              <div class="flex items-center gap-1.5">
                <div class="h-7 px-2.5 bg-white/[0.06] border border-white/[0.08] rounded flex items-center justify-center">
                  <span class="text-[10px] font-bold text-slate-300 tracking-wide">VISA</span>
                </div>
                <div class="h-7 px-2.5 bg-white/[0.06] border border-white/[0.08] rounded flex items-center justify-center">
                  <span class="text-[10px] font-bold text-slate-300 tracking-wide">MC</span>
                </div>
                <div class="h-7 px-2.5 bg-white/[0.06] border border-white/[0.08] rounded flex items-center justify-center">
                  <span class="text-[10px] font-bold text-slate-300 tracking-wide">MP</span>
                </div>
                <div class="h-7 px-2.5 bg-white/[0.06] border border-white/[0.08] rounded flex items-center justify-center">
                  <span class="text-[10px] font-bold text-slate-300 tracking-wide">AMEX</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-5 order-3">
              <a href="#" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
