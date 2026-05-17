import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storage = inject(StorageService);
  const token = authService.token();
  const sessionId = storage.get('cart_session_id');

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (sessionId) {
    headers = headers.set('X-Session-ID', sessionId);
  }

  headers = headers.set('Accept', 'application/json');

  // Auto-append currency param based on saved language
  const lang = storage.get('app_lang') || 'es';
  const currency = lang === 'en' ? 'USD' : 'PEN';

  let params = req.params;
  if (!params.has('currency')) {
    params = params.set('currency', currency);
  }

  const cloned = req.clone({ headers, params });
  return next(cloned);
};
