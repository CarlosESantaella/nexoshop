import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReviewRequest } from '../models/review.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getReviews(productSlug: string, page: number = 1): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/products/${productSlug}/reviews`, { params });
  }

  createReview(productSlug: string, data: CreateReviewRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/products/${productSlug}/reviews`, data);
  }
}
