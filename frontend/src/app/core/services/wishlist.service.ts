import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  wishlistIds = signal<number[]>([]);

  loadWishlist(): void {
    this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/wishlist/check`).subscribe({
      next: res => { if (res.success && res.data) this.wishlistIds.set(res.data); },
      error: () => {}
    });
  }

  getWishlistProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/wishlist`);
  }

  toggle(productId: number): Observable<ApiResponse<{ action: string }>> {
    return this.http.post<ApiResponse<{ action: string }>>(`${this.apiUrl}/wishlist/toggle`, { product_id: productId })
      .pipe(tap(res => {
        if (res.success && res.data) {
          if (res.data.action === 'added') {
            this.wishlistIds.update(ids => [...ids, productId]);
          } else {
            this.wishlistIds.update(ids => ids.filter(id => id !== productId));
          }
        }
      }));
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistIds().includes(productId);
  }
}
