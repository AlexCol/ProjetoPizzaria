import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as zlib from 'zlib';

@Injectable()
export class GzipInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    // Seta o header correto
    res.header('Content-Encoding', 'gzip');
    res.header('Content-Type', 'application/json');

    return next.handle().pipe(
      map((data) => {
        console.log('📦 GzipInterceptor chamado.');
        const json = JSON.stringify(data);
        return zlib.gzipSync(json);
      }),
    );
  }
}
