import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  if (!token || request.url.endsWith('/api/auth/login')) {
    return next(request);
  }

  const authorizedRequest = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authorizedRequest).pipe(catchError(error => {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      auth.handleUnauthorized();
    }
    return throwError(() => error);
  }));
};
