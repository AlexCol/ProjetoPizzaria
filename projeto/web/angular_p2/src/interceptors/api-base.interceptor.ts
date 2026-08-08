import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/logger/logger.service';

export const apiBaseInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const baseUrl = environment.apiBaseUrl;

  const apiRequest = req.clone({
    url: `${baseUrl}${req.url}`,
    withCredentials: true,
    setHeaders: {
      'Content-Type': 'application/json',
      'app-origin': 'web',
    },
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
