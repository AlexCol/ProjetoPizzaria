import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(message: string): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.log(`[LOG]${message}`);
    }
  }

  error(message: string): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR]${message}`);
    }
  }
}
