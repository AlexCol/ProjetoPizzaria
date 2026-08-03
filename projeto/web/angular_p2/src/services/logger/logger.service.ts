import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(...data: any[]): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.log('[LOG]', ...data);
    }
  }

  warn(...data: any[]): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', ...data);
    }
  }

  error(...data: any[]): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.error('[ERROR]', ...data);
    }
  }
}
