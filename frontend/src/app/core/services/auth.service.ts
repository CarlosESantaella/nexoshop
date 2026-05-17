import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);
  private injector = inject(Injector);
  private apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  token = signal<string | null>(this.storage.get('auth_token'));
  isLoading = signal(false);
  /** Resolves when the initial loadUser() call completes (success or failure) */
  userReady!: Promise<void>;
  private _initialized = false;

  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    // Don't call loadUser() here — it triggers HttpClient which injects AuthService again (NG0200 circular dep).
    // Instead, initialize lazily on first access via ensureInitialized().
  }

  /** Must be called once after DI is fully resolved. Guards and APP_INITIALIZER call this. */
  ensureInitialized(): Promise<void> {
    if (!this._initialized) {
      this._initialized = true;
      if (this.token()) {
        this.userReady = this.loadUser();
      } else {
        this.userReady = Promise.resolve();
      }
    }
    return this.userReady;
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data.user, res.data.token);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setAuth(res.data.user, res.data.token);
        }
      })
    );
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearAuth())
    );
  }

  loadUser(): Promise<void> {
    this.isLoading.set(true);
    return new Promise<void>(resolve => {
      this.http.get<ApiResponse<User>>(`${this.apiUrl}/auth/user`).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.currentUser.set(res.data);
            import('./wishlist.service').then(m => {
              const wishlistService = this.injector.get(m.WishlistService);
              wishlistService.loadWishlist();
            }).catch(() => {});
          }
          this.isLoading.set(false);
          resolve();
        },
        error: () => { this.clearAuth(); this.isLoading.set(false); resolve(); }
      });
    });
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/auth/profile`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUser.set(res.data);
        }
      })
    );
  }

  changePassword(data: { current_password: string; password: string; password_confirmation: string }): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.apiUrl}/auth/change-password`, data);
  }

  forgotPassword(email: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  private setAuth(user: User, token: string): void {
    this.currentUser.set(user);
    this.token.set(token);
    this.storage.set('auth_token', token);
  }

  clearAuth(): void {
    this.currentUser.set(null);
    this.token.set(null);
    this.storage.remove('auth_token');
  }
}
