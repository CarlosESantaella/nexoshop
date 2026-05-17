import { Component, inject, signal, computed, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SearchService } from '../../../core/services/search.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { StorageService } from '../../../core/services/storage.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, DecimalPipe, RouterLink, RouterLinkActive, FormsModule, TranslateModule],
  template: `
    <!-- Top Bar -->
    <div class="fixed top-0 left-0 right-0 z-[60] bg-slate-800 text-white text-[11px] transition-transform duration-300"
         [class.translate-y-0]="showTopBar()"
         [class.-translate-y-full]="!showTopBar()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-8">
        <p class="hidden sm:block text-slate-300 tracking-wide">
          {{ 'HOME.FREE_SHIPPING' | translate:{ threshold: freeShippingText() } }}
        </p>
        <p class="sm:hidden text-slate-300 text-center flex-1 tracking-wide">
          {{ 'HOME.FREE_SHIPPING' | translate:{ threshold: freeShippingText() } }}
        </p>

        <!-- Language Switcher -->
        <div class="flex items-center gap-1">
          <button
            (click)="switchLang('es')"
            [ngClass]="currentLang() === 'es' ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white'"
            class="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all text-[11px]">
            <span class="text-sm leading-none">&#127477;&#127466;</span>
            <span class="hidden sm:inline">ES</span>
          </button>
          <button
            (click)="switchLang('en')"
            [ngClass]="currentLang() === 'en' ? 'text-white bg-white/15' : 'text-slate-400 hover:text-white'"
            class="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all text-[11px]">
            <span class="text-sm leading-none">&#127482;&#127480;</span>
            <span class="hidden sm:inline">EN</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Spacer for fixed top bar -->
    <div class="h-8"></div>

    <!-- Main Header -->
    <header
      [ngClass]="{ 'shadow-md shadow-slate-900/[0.06]': isSticky() }"
      class="bg-white sticky z-50 transition-[box-shadow,top] duration-300 border-b border-slate-100/80"
      [style.top]="showTopBar() ? '32px' : '0px'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-[72px] gap-4">

          <!-- Mobile Menu Button -->
          <button
            (click)="toggleMobileMenu()"
            class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-600 transition-colors"
            aria-label="Menu">
            <svg *ngIf="!mobileMenuOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg *ngIf="mobileMenuOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Logo -->
          <a routerLink="/" class="shrink-0" (click)="closeMobileMenu()">
            <img src="/assets/logo/nexoshop-logo.webp" alt="NexoShop" class="h-12 lg:h-14 w-auto" />
          </a>

          <!-- Search Bar (Desktop) -->
          <div class="hidden lg:flex flex-1 max-w-xl relative" #searchContainer>
            <div class="relative w-full">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchInput()"
                (focus)="searchFocused.set(true)"
                (keydown.enter)="executeSearch()"
                [placeholder]="'NAV.SEARCH_PLACEHOLDER' | translate"
                class="w-full h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-white shadow-sm
                       focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10
                       transition-all text-sm outline-none" />
              <svg class="w-5 h-5 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <button
                *ngIf="searchQuery"
                (click)="clearSearch()"
                class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Autocomplete Dropdown -->
            <div
              *ngIf="showAutocomplete() && autocompleteResults().length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200
                     max-h-80 overflow-y-auto z-50">
              <a *ngFor="let item of autocompleteResults()"
                 [routerLink]="['/products', item.slug]"
                 (click)="selectAutocomplete(item)"
                 class="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0">
                <img
                  *ngIf="item.primary_image"
                  [src]="item.primary_image"
                  [alt]="item.name"
                  class="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                <div *ngIf="!item.primary_image"
                  class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">{{ item.name }}</p>
                  <p class="text-xs text-primary-600 font-semibold">{{ item.price | number:'1.2-2' }}</p>
                </div>
              </a>
            </div>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-1 sm:gap-2">

            <!-- Wishlist -->
            <a routerLink="/account/wishlist"
              class="relative p-2.5 rounded-full text-slate-500 hover:text-primary-600 hover:bg-slate-50 transition-all duration-200"
              [attr.aria-label]="'NAV.WISHLIST' | translate">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span
                *ngIf="wishlistCount() > 0"
                class="absolute top-0.5 right-0.5 w-4 h-4 bg-accent-500 text-white text-[9px]
                       font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {{ wishlistCount() }}
              </span>
            </a>

            <!-- Cart -->
            <a routerLink="/cart"
              class="relative p-2.5 rounded-full text-slate-500 hover:text-primary-600 hover:bg-slate-50 transition-all duration-200"
              [attr.aria-label]="'NAV.CART' | translate">
              <svg class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
              </svg>
              <span
                *ngIf="cartService.itemCount() > 0"
                class="absolute top-0.5 right-0.5 min-w-4 h-4 bg-primary-600 text-white text-[9px]
                       font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white">
                {{ cartService.itemCount() }}
              </span>
            </a>

            <!-- User Dropdown -->
            <div class="relative" #userDropdown>
              <button
                (click)="toggleUserMenu()"
                class="flex items-center gap-1.5 p-2 rounded-full text-slate-500
                       hover:text-primary-600 hover:bg-slate-50 transition-all duration-200">
                <svg *ngIf="!authService.isLoggedIn()" class="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <div *ngIf="authService.isLoggedIn()"
                  class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {{ userInitial() }}
                </div>
                <svg class="w-3.5 h-3.5 hidden sm:block text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                *ngIf="userMenuOpen()"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200
                       py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                <!-- Logged In -->
                <ng-container *ngIf="authService.isLoggedIn()">
                  <div class="px-4 py-3 border-b border-slate-100">
                    <p class="text-sm font-semibold text-slate-800">{{ authService.currentUser()?.name }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ authService.currentUser()?.email }}</p>
                  </div>
                  <a routerLink="/account/profile" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    {{ 'NAV.PROFILE' | translate }}
                  </a>
                  <a routerLink="/account/orders" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    {{ 'NAV.MY_ORDERS' | translate }}
                  </a>
                  <a routerLink="/account/wishlist" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    {{ 'NAV.WISHLIST' | translate }}
                  </a>

                  <!-- Admin Link -->
                  <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-700 hover:bg-accent-50 transition-colors font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {{ 'NAV.ADMIN_PANEL' | translate }}
                  </a>

                  <div class="border-t border-slate-100 mt-1 pt-1">
                    <button (click)="onLogout()"
                      class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      {{ 'NAV.LOGOUT' | translate }}
                    </button>
                  </div>
                </ng-container>

                <!-- Not Logged In -->
                <ng-container *ngIf="!authService.isLoggedIn()">
                  <div class="px-4 py-3 border-b border-slate-100">
                    <p class="text-sm font-semibold text-slate-800">{{ 'NAV.MY_ACCOUNT' | translate }}</p>
                  </div>
                  <a routerLink="/auth/login" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    {{ 'NAV.LOGIN' | translate }}
                  </a>
                  <a routerLink="/auth/register" (click)="closeUserMenu()"
                    class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    {{ 'NAV.REGISTER' | translate }}
                  </a>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Bar -->
      <nav class="hidden lg:block">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-6 h-11 overflow-x-auto">
            <a routerLink="/" routerLinkActive="text-primary-600 border-primary-600" [routerLinkActiveOptions]="{ exact: true }"
              class="relative text-[13px] text-slate-600 hover:text-primary-600 transition-colors whitespace-nowrap font-medium tracking-wide border-b-2 border-transparent h-full flex items-center">
              {{ 'NAV.HOME' | translate }}
            </a>
            <a routerLink="/products" routerLinkActive="text-primary-600 border-primary-600"
              class="relative text-[13px] text-slate-600 hover:text-primary-600 transition-colors whitespace-nowrap font-medium tracking-wide border-b-2 border-transparent h-full flex items-center">
              {{ 'NAV.SHOP' | translate }}
            </a>
            <a *ngFor="let cat of categories()"
              [routerLink]="['/products']" [queryParams]="{ category: cat.slug }"
              class="relative text-[13px] text-slate-600 hover:text-primary-600 transition-colors whitespace-nowrap font-medium tracking-wide border-b-2 border-transparent h-full flex items-center">
              {{ 'CAT.' + cat.slug | translate }}
            </a>
            <a routerLink="/products" [queryParams]="{ sort_by: 'newest' }" routerLinkActive="text-primary-600 border-primary-600"
              class="relative text-[13px] text-slate-600 hover:text-primary-600 transition-colors whitespace-nowrap font-medium tracking-wide border-b-2 border-transparent h-full flex items-center">
              {{ 'NAV.NEW_ARRIVALS' | translate }}
            </a>
            <a routerLink="/products" [queryParams]="{ on_sale: true }" routerLinkActive="text-accent-600 border-accent-500"
              class="relative text-[13px] text-accent-600 hover:text-accent-700 transition-colors whitespace-nowrap font-semibold tracking-wide border-b-2 border-transparent h-full flex items-center">
              {{ 'NAV.DEALS' | translate }}
            </a>
          </div>
        </div>
      </nav>
    </header>

    <!-- Mobile Menu Overlay -->
    <div
      *ngIf="mobileMenuOpen()"
      (click)="closeMobileMenu()"
      class="fixed inset-0 bg-black/50 z-[70] lg:hidden backdrop-blur-sm">
    </div>

    <!-- Mobile Menu Drawer -->
    <div
      [ngClass]="mobileMenuOpen() ? 'translate-x-0' : '-translate-x-full'"
      class="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-[80] lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto">

      <!-- Mobile Menu Header -->
      <div class="flex items-center justify-between px-5 h-16 border-b border-slate-100">
        <a routerLink="/" (click)="closeMobileMenu()" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <span class="text-lg font-bold font-heading">
            <span class="text-primary-600">Nexo</span><span class="text-slate-800">Shop</span>
          </span>
        </a>
        <button (click)="closeMobileMenu()" class="p-2 rounded-lg hover:bg-slate-100">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Search -->
      <div class="px-5 py-4 border-b border-slate-100">
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keydown.enter)="executeSearch(); closeMobileMenu()"
            [placeholder]="'NAV.SEARCH_PLACEHOLDER' | translate"
            class="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50
                   focus:border-primary-500 focus:bg-white transition-all text-sm outline-none" />
          <svg class="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Mobile User Info -->
      <div *ngIf="authService.isLoggedIn()" class="px-5 py-4 border-b border-slate-100 bg-primary-50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {{ userInitial() }}
          </div>
          <div>
            <p class="font-semibold text-sm text-slate-800">{{ authService.currentUser()?.name }}</p>
            <p class="text-xs text-slate-500">{{ authService.currentUser()?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <nav class="py-3">
        <a routerLink="/" (click)="closeMobileMenu()"
          routerLinkActive="bg-primary-50 text-primary-600" [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          {{ 'NAV.HOME' | translate }}
        </a>
        <a routerLink="/products" (click)="closeMobileMenu()"
          routerLinkActive="bg-primary-50 text-primary-600"
          class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          {{ 'NAV.SHOP' | translate }}
        </a>

        <!-- Categories in Mobile -->
        <div *ngIf="categories().length > 0" class="border-t border-slate-100 mt-2 pt-2">
          <p class="px-5 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {{ 'NAV.CATEGORIES' | translate }}
          </p>
          <a *ngFor="let cat of categories()"
            [routerLink]="['/products']" [queryParams]="{ category: cat.slug }"
            (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors pl-8">
            {{ 'CAT.' + cat.slug | translate }}
          </a>
        </div>

        <div class="border-t border-slate-100 mt-2 pt-2">
          <a routerLink="/products" [queryParams]="{ sort_by: 'newest' }" (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ 'NAV.NEW_ARRIVALS' | translate }}
          </a>
          <a routerLink="/products" [queryParams]="{ on_sale: true }" (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-accent-600 hover:bg-accent-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
            </svg>
            {{ 'NAV.DEALS' | translate }}
          </a>
        </div>

        <!-- Mobile Account Links -->
        <div class="border-t border-slate-100 mt-2 pt-2">
          <ng-container *ngIf="authService.isLoggedIn()">
            <a routerLink="/account/profile" (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ 'NAV.PROFILE' | translate }}
            </a>
            <a routerLink="/account/orders" (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              {{ 'NAV.MY_ORDERS' | translate }}
            </a>
            <a *ngIf="authService.isAdmin()" routerLink="/admin" (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-accent-700 hover:bg-accent-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ 'NAV.ADMIN_PANEL' | translate }}
            </a>
            <button (click)="onLogout(); closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {{ 'NAV.LOGOUT' | translate }}
            </button>
          </ng-container>

          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/auth/login" (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              {{ 'NAV.LOGIN' | translate }}
            </a>
            <a routerLink="/auth/register" (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-5 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              {{ 'NAV.REGISTER' | translate }}
            </a>
          </ng-container>
        </div>
      </nav>
    </div>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private searchService = inject(SearchService);
  private categoryService = inject(CategoryService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private elRef = inject(ElementRef);
  private storage = inject(StorageService);

  searchQuery = '';
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  searchFocused = signal(false);
  isSticky = signal(false);
  showTopBar = signal(true);
  private lastScrollY = 0;
  categories = signal<Category[]>([]);
  autocompleteResults = signal<any[]>([]);
  currentLang = signal(this.translate.currentLang || this.translate.defaultLang || 'es');

  freeShippingText = computed(() => {
    const lang = this.currentLang();
    const currencies = environment.currencies as Record<string, { code: string; symbol: string }>;
    const curr = currencies[lang] || currencies['es'];
    // Base: $150 USD free shipping threshold; ~S/555 in PEN
    const threshold = lang === 'es' ? 555 : 150;
    return `${curr.symbol}${threshold}`;
  });

  wishlistCount = computed(() => this.wishlistService.wishlistIds().length);
  userInitial = computed(() => {
    const name = this.authService.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  showAutocomplete = computed(() => {
    return this.searchFocused() && this.searchQuery.length >= 2 && this.autocompleteResults().length > 0;
  });

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.categories.set(res.data.filter(c => c.is_active).slice(0, 8));
        }
      },
      error: () => {}
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of({ success: true, data: [] });
        }
        return this.searchService.autocomplete(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      if (res.success && res.data) {
        this.autocompleteResults.set(res.data);
      }
    });

    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(event => {
      this.currentLang.set(event.lang);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:scroll')
  onScroll(): void {
    const currentY = window.scrollY;
    this.isSticky.set(currentY > 40);

    // Show top bar on scroll up, hide on scroll down
    if (currentY < this.lastScrollY || currentY <= 0) {
      this.showTopBar.set(true);
    } else if (currentY > this.lastScrollY && currentY > 50) {
      this.showTopBar.set(false);
    }
    this.lastScrollY = currentY;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
      this.searchFocused.set(false);
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  executeSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
      this.autocompleteResults.set([]);
      this.searchFocused.set(false);
    }
  }

  selectAutocomplete(item: any): void {
    this.searchQuery = '';
    this.autocompleteResults.set([]);
    this.searchFocused.set(false);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.autocompleteResults.set([]);
  }

  switchLang(lang: string): void {
    if (lang === (this.storage.get('app_lang') || 'es')) return;
    this.storage.set('app_lang', lang);
    window.location.reload();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout().subscribe(() => {
      this.closeUserMenu();
      this.router.navigate(['/']);
    });
  }
}
