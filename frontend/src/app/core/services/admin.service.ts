import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  // Dashboard
  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`);
  }

  // Products
  getProducts(page: number = 1, search?: string): Observable<any> {
    let params = new HttpParams().set('page', page);
    if (search) params = params.set('search', search);
    return this.http.get(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/products/${id}`);
  }

  toggleProductFeatured(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/products/${id}/toggle-featured`, {});
  }

  toggleProductActive(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/products/${id}/toggle-active`, {});
  }

  uploadProductImages(productId: number, files: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('images[]', file));
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/products/${productId}/images`, formData);
  }

  deleteProductImage(productId: number, imageId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/products/${productId}/images/${imageId}`);
  }

  // Categories
  getCategories(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/categories`);
  }

  createCategory(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/categories`, data);
  }

  updateCategory(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/categories/${id}`);
  }

  // Orders
  getOrders(page: number = 1, status?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders`, { params });
  }

  getOrder(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  // Users
  getUsers(page: number = 1): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users`, { params: new HttpParams().set('page', page) });
  }

  toggleUserActive(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/users/${id}/toggle-active`, {});
  }

  // Coupons
  getCoupons(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/coupons`);
  }

  createCoupon(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/coupons`, data);
  }

  updateCoupon(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/coupons/${id}`, data);
  }

  deleteCoupon(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/coupons/${id}`);
  }

  // Reviews
  getReviews(page: number = 1, status?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('page', page);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reviews`, { params });
  }

  approveReview(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/reviews/${id}/approve`, {});
  }

  rejectReview(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/reviews/${id}/reject`, {});
  }

  // Settings
  getSettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/settings`);
  }

  getSettingsByGroup(group: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/settings/${group}`);
  }

  updateSettings(settings: { key: string; value: any }[]): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/settings`, { settings });
  }
}
