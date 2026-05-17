import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslateModule],
  styles: [`
    @keyframes ac-fade-in {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    :host { display: block; }
    .ac-fade-in { animation: ac-fade-in 0.5s ease-out both; }
    .ac-fade-in-d1 { animation: ac-fade-in 0.5s ease-out 0.08s both; }
  `],
  template: `
    <div class="bg-gray-50 min-h-screen">

      <!-- ========== PAGE HEADER ========== -->
      <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div class="absolute top-1/2 -translate-y-1/2 -right-20 w-[280px] h-[280px] rounded-full bg-primary-500/[0.06] blur-[80px] pointer-events-none"></div>
        <div class="absolute -bottom-10 left-1/4 w-[180px] h-[180px] rounded-full bg-accent-500/[0.05] blur-[60px] pointer-events-none"></div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-10 md:pb-16 relative z-10">
          <nav class="flex items-center gap-2 text-sm mb-6 ac-fade-in">
            <a routerLink="/" class="text-slate-400 hover:text-white transition-colors duration-200">{{ 'COMMON.HOME' | translate }}</a>
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-white/90 font-medium">{{ 'ACCOUNT.TITLE' | translate }}</span>
          </nav>
          <div class="flex items-center gap-4 ac-fade-in-d1">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/20">
              {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-bold tracking-tight"
                  style="background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: linear-gradient(to right, white, var(--color-primary-100), var(--color-accent-300));">
                {{ 'ACCOUNT.WELCOME' | translate }}, {{ authService.currentUser()?.name }}
              </h1>
              <p class="text-slate-400 text-sm mt-0.5">{{ authService.currentUser()?.email }}</p>
            </div>
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

          <!-- Mobile tabs -->
          <div class="lg:hidden overflow-x-auto scrollbar-none">
            <div class="flex gap-2 pb-2">
              <a routerLink="/account/profile" routerLinkActive="!bg-slate-800 !text-white !border-slate-800"
                 class="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                {{ 'ACCOUNT.PROFILE' | translate }}
              </a>
              <a routerLink="/account/orders" routerLinkActive="!bg-slate-800 !text-white !border-slate-800"
                 class="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
                {{ 'ACCOUNT.ORDERS' | translate }}
              </a>
              <a routerLink="/account/addresses" routerLinkActive="!bg-slate-800 !text-white !border-slate-800"
                 class="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                {{ 'ACCOUNT.ADDRESSES' | translate }}
              </a>
              <a routerLink="/account/wishlist" routerLinkActive="!bg-slate-800 !text-white !border-slate-800"
                 class="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                {{ 'ACCOUNT.WISHLIST' | translate }}
              </a>
              <a routerLink="/account/change-password" routerLinkActive="!bg-slate-800 !text-white !border-slate-800"
                 class="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-white border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                {{ 'ACCOUNT.CHANGE_PASSWORD' | translate }}
              </a>
            </div>
          </div>

          <!-- Desktop sidebar -->
          <aside class="hidden lg:block lg:w-64 shrink-0">
            <div class="sticky top-[152px]">
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <nav class="py-2">
                  <a routerLink="/account/profile" routerLinkActive="!bg-primary-50/60 !text-primary-700 before:!opacity-100"
                     class="relative flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 transition-all
                            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:rounded-r-full before:bg-primary-500 before:opacity-0 before:transition-opacity">
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    {{ 'ACCOUNT.PROFILE' | translate }}
                  </a>
                  <a routerLink="/account/orders" routerLinkActive="!bg-primary-50/60 !text-primary-700 before:!opacity-100"
                     class="relative flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 transition-all
                            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:rounded-r-full before:bg-primary-500 before:opacity-0 before:transition-opacity">
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
                    {{ 'ACCOUNT.ORDERS' | translate }}
                  </a>
                  <a routerLink="/account/addresses" routerLinkActive="!bg-primary-50/60 !text-primary-700 before:!opacity-100"
                     class="relative flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 transition-all
                            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:rounded-r-full before:bg-primary-500 before:opacity-0 before:transition-opacity">
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    {{ 'ACCOUNT.ADDRESSES' | translate }}
                  </a>
                  <a routerLink="/account/wishlist" routerLinkActive="!bg-primary-50/60 !text-primary-700 before:!opacity-100"
                     class="relative flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 transition-all
                            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:rounded-r-full before:bg-primary-500 before:opacity-0 before:transition-opacity">
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                    {{ 'ACCOUNT.WISHLIST' | translate }}
                  </a>
                  <a routerLink="/account/change-password" routerLinkActive="!bg-primary-50/60 !text-primary-700 before:!opacity-100"
                     class="relative flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 transition-all
                            before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:rounded-r-full before:bg-primary-500 before:opacity-0 before:transition-opacity">
                    <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
                    {{ 'ACCOUNT.CHANGE_PASSWORD' | translate }}
                  </a>
                </nav>
              </div>
            </div>
          </aside>

          <!-- Main content -->
          <main class="flex-1 min-w-0"><router-outlet /></main>
        </div>
      </div>
    </div>
  `,
})
export class AccountComponent {
  authService = inject(AuthService);
}
