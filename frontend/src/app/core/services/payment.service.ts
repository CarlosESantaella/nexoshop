import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createPreference(orderNumber: string): Observable<ApiResponse<{ preference_id: string; init_point: string; sandbox_init_point: string }>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/payments/create-preference`, { order_number: orderNumber });
  }
}
