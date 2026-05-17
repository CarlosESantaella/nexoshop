import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CouponValidation } from '../models/coupon.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  validateCoupon(code: string, subtotal: number): Observable<ApiResponse<CouponValidation>> {
    return this.http.post<ApiResponse<CouponValidation>>(`${this.apiUrl}/coupons/validate`, { code, subtotal });
  }
}
