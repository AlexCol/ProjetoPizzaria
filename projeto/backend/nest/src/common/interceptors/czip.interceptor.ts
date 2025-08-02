import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomNestLogger } from 'src/modules/logger/logger.service';
import * as zlib from 'zlib';

@Injectable()
export class GzipInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomNestLogger) {
    // Consigo usar o logger diretamente aqui pois ele é declarado como
    // módulo global e foi importado no AppModule
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        this.logger.log('📦 GzipInterceptor chamado.');
        if (data === null || data === undefined) // Se não houver dados, retorna um objeto vazio
          return {};
        if (!data)
          return data; // Se os dados não forem válidos, retorna como estão

        // Seta o header correto
        res.header('Content-Encoding', 'gzip');
        res.header('Content-Type', 'application/json');
        const json = JSON.stringify(data);
        return zlib.gzipSync(json);
      }),
    );
  }
}
