import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  search(query: string, filters: Record<string, any> = {}): Observable<any> {
    let params = new HttpParams().set('q', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, String(value));
    });
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  autocomplete(query: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/search/autocomplete`, {
      params: new HttpParams().set('q', query)
    });
  }
}
