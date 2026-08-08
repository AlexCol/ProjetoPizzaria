import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

const DEFAULT_API_ERROR_MESSAGE = 'Ocorreu um erro desconhecido. Tente novamente mais tarde.';

export function getApiErrorMessage(error: unknown, fallback = DEFAULT_API_ERROR_MESSAGE): string {
  const safeFallback = fallback.trim() || DEFAULT_API_ERROR_MESSAGE;
  const errorBody = error instanceof HttpErrorResponse ? error.error : error;
  const message = extractMessage(errorBody);

  return message || safeFallback;
}

export function processaErros(httpError: HttpErrorResponse): Observable<never> {
  return throwError(() => getApiErrorMessage(httpError));
}

function extractMessage(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(extractMessage).filter(Boolean).join(', ');
  }

  if (value && typeof value === 'object') {
    const errorBody = value as Record<string, unknown>;
    return extractMessage(errorBody['Message'] ?? errorBody['message']);
  }

  return '';
}
