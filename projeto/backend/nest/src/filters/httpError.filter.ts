import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException) //isso é importante, senão vai pegar tudo (lembrando que a tipagem é só pro editor/compilador)
export class HttpErrorFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    console.log(`❌ HttpErrorFilter disparado.`);

    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus() || 500; //se não tiver status, assume 500 (erro interno do servidor)
    const exceptionResponse = exception.getResponse(); //!tbm é getResponse, mas aqui é da exception
    const message = exceptionResponse['message'] || exception.message || 'Erro desconhecido';

    response.status(status).send({
      statusCode: status,
      message,
    });
  }
}
