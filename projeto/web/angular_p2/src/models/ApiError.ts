import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export type ApiError = {
  message: string[];
};

export function processaErros(httpError: HttpErrorResponse): Observable<never> {
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
