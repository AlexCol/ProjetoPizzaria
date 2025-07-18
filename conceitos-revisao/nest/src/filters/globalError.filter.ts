import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";

export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    console.log(`❌ GlobalErrorFilter disparado.`);

    const response = host.switchToHttp().getResponse();
    const status = exception['status'] || 500;
    const message = `Global error: ${exception.message || 'Internal server error'}`;

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
