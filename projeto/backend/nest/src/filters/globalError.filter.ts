import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { FastifyReply } from "fastify";

export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    console.log(`❌ GlobalErrorFilter disparado.`);

    const response = host.switchToHttp().getResponse<FastifyReply>();
    const status = exception['status'] || 500;

    const exceptionResponse = exception['response'] || {};
    const message = exceptionResponse.message || exception.message || 'Internal server error';

    response.status(status).send({
      statusCode: status,
      message,
    });
  }
}
