import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private apiUrl = environment.apiUrl;

  cart = signal<Cart | null>(null);
  isLoaded = signal(false);
  itemCount = computed(() => this.cart()?.item_count ?? 0);
  subtotal = computed(() => this.cart()?.total ?? 0);

  constructor() {
    if (!this.storage.get('cart_session_id')) {
      const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      this.storage.set('cart_session_id', id);
    }
    setTimeout(() => this.loadCart(), 0);
  }

  loadCart(): void {
    this.http.get<ApiResponse<any>>(`${this.apiUrl}/cart`).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.cart.set({
            id: res.data.cart?.id,
            items: res.data.items || [],
            total: res.data.total || 0,
            item_count: res.data.item_count || 0,
            session_id: res.data.session_id,
            shipping_cost: res.data.shipping_cost,
            free_shipping_threshold: res.data.free_shipping_threshold,
            currency: res.data.currency,
          });
          if (res.data.session_id) {
            this.storage.set('cart_session_id', res.data.session_id);
          }
        }
        this.isLoaded.set(true);
      },
      error: () => {
        this.cart.set(null);
        this.isLoaded.set(true);
      }
    });
  }

  addItem(productId: number, quantity: number = 1): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/cart/items`, {
      product_id: productId, quantity
    }).pipe(tap(res => {
      if (res.success) this.loadCart();
    }));
  }

  updateItem(itemId: number, quantity: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/cart/items/${itemId}`, { quantity })
      .pipe(tap(res => {
        if (res.success) this.loadCart();
      }));
  }

  removeItem(itemId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/cart/items/${itemId}`)
      .pipe(tap(res => {
        if (res.success) this.loadCart();
      }));
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/cart`)
      .pipe(tap(() => this.cart.set(null)));
  }

  mergeCarts(): Observable<ApiResponse<any>> {
    const sessionId = this.storage.get('cart_session_id');
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/cart/merge`, { session_id: sessionId })
      .pipe(tap(() => this.loadCart()));
  }
}
