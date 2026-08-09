import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/logger/logger.service';
import { CsrfService } from '../services/security/csrf.service';

export const apiBaseInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const csrfService = inject(CsrfService);
  const logger = inject(LoggerService);
  const baseUrl = environment.apiBaseUrl;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'app-origin': 'web',
  };

  // fluxo para adicionar header X-CSRF-TOKEN apenas para métodos que alteram dados (POST, PUT, PATCH, DELETE)
  const isUnsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
  if (isUnsafeMethod && csrfService.token) {
    headers['X-CSRF-TOKEN'] = csrfService.token;
  }

  const apiRequest = req.clone({
    url: `${baseUrl}${req.url}`,
    withCredentials: true,
    setHeaders: headers,
  });

  return next(apiRequest).pipe(
    // com isso, se a api retornar 401, o usuário será deslogado e redirecionado para a tela de login
    catchError((error: unknown) => {
      logger.log(`[apiBaseInterceptor] error: ${error}`);
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.expireSession();
      }
      return throwError(() => error);
    }),
  );
};
