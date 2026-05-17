import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Don't redirect if this was the initial auth check on page load
          // Let loadUser() and guards handle that flow
          if (!req.url.includes('/auth/user')) {
            authService.clearAuth();
            router.navigate(['/auth/login']);
          }
          break;
        case 403:
          toast.error(translate.instant('ERRORS.ACCESS_DENIED'));
          break;
        case 422: {
          const errors = error.error?.errors;
          if (errors) {
            const firstField = Object.keys(errors)[0];
            const firstMessage = errors[firstField]?.[0];
            if (firstMessage) { toast.error(firstMessage); break; }
          }
          toast.error(error.error?.message || translate.instant('ERRORS.VALIDATION'));
          break;
        }
        case 500:
          toast.error(translate.instant('ERRORS.SERVER'));
          break;
        case 429:
          toast.error(translate.instant('ERRORS.TOO_MANY_REQUESTS') || 'Too many requests. Please wait.');
          break;
        case 0:
          toast.error(translate.instant('ERRORS.CONNECTION'));
          break;
      }
      return throwError(() => error);
    })
  );
};
