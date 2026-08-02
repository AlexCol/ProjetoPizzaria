import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { LoggerService } from '../services/logger/logger.service';

export type ApiError = {
  message: string[];
};

export function processaErros(httpError: HttpErrorResponse): Observable<never> {
  const logger = inject(LoggerService);

  logger.log(`[processaErros]: ${httpError.status} - ${httpError.message}`);

  if (Array.isArray(httpError.error.Message)) {
    const apiError: ApiError = {
      message: httpError.error.Message,
    };
    return throwError(() => apiError.message.join(', '));
  }

  const apiError: ApiError = {
    message: [httpError.error.Message || 'Ocorreu um erro desconhecido.'],
  };
  return throwError(() => apiError.message.join(', '));
}
