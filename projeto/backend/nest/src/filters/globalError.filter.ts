import { ArgumentsHost, ExceptionFilter, Injectable } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { CustomNestLogger } from "src/modules/logger/logger.service";
import * as zlib from 'zlib';

@Injectable()
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomNestLogger) {
    // Consigo usar o logger diretamente aqui pois ele é declarado como
    // módulo global e foi importado no AppModule
  }
  catch(exception: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const status = exception['status'] || 500;

    const exceptionResponse = exception['response'] || {};
    const message = exceptionResponse.message || exception.message || 'Internal server error';

    this.logger.error(`❌ GlobalErrorFilter disparado: message: ${message}, status: ${status}`, exception.stack);

    const errorResponse = {
      statusCode: status,
      message,
    };
    const json = JSON.stringify(errorResponse);
    const compressed = zlib.gzipSync(json); //no worries about the header, its handled by CzipInterceptor
    response.status(status).send(compressed);
  }
}
