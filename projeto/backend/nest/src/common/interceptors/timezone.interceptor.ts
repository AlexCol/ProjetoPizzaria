import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateTime } from 'luxon';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.adjustTimezones(data))
    );
  }

  private adjustTimezones(obj: any): any {
    if (!obj) return obj;

    if (obj instanceof Date) {
      // ✅ Interpreta a data como UTC e converte para Brasília
      return DateTime.fromJSDate(obj, { zone: 'utc' })
        .setZone('America/Sao_Paulo')
        .toISO();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.adjustTimezones(item));
    }

    if (typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.adjustTimezones(value);
      }
      return result;
    }

    return obj;
  }
}