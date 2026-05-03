import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, catchError } from 'rxjs';

/** Global HTTP error handler */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Unauthorized — clear token and redirect to home
          localStorage.removeItem('zoieng_token');
          localStorage.removeItem('zoieng_user');
          router.navigate(['/']);
          break;
        case 403:
          console.error('[Error] 403 Forbidden:', req.url);
          break;
        case 404:
          console.error('[Error] 404 Not Found:', req.url);
          break;
        case 500:
        case 502:
        case 503:
          console.error('[Error] Server error:', error.status, req.url);
          break;
        default:
          if (!navigator.onLine) {
            console.error('[Error] No internet connection');
          }
      }
      return throwError(() => error);
    })
  );
};
