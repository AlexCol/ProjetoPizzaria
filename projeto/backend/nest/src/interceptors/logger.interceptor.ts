import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { CustomNestLogger } from 'src/modules/logger/logger.service';
import * as zlib from 'zlib';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomNestLogger) {
    //consigo usar o logger diretamente aqui pois ele é declarado como
    //modulo global e foi importado no AppModule
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();

    const path = req.url;
    const method = req.method;

    this.logger.log(`Request received: ${method} ${path}`);

    return next.handle().pipe(
      finalize(() => { // Sempre chamado, independentemente do sucesso ou falha da requisição.
        this.logger.log(`Request processing completed for: ${method} ${path}`);
      })
    );
  }
}
