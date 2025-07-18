import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { finalize, Observable, tap } from "rxjs";

@Injectable()
export class StopWatchInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    console.log("⌚ StopWatchInterceptor chamado.");
    const now = Date.now();

    return next.handle().pipe(
      finalize(() => { // Sempre chamado, independentemente do sucesso ou falha da requisição.
        console.log(`⌚ Execution time: ${Date.now() - now}ms`);
      }),
      tap({
        next: () => console.log('[StopWatchInterceptor next] Called'), // Chamado quando o controller retorna uma resposta com sucesso.
        error: () => console.log('[StopWatchInterceptor error] Called'), // Chamado se um erro ocorrer durante o processamento da requisição.
        complete: () => console.log('[StopWatchInterceptor tap complete] Called') // Chamado quando o fluxo de dados do Observable é concluído com sucesso.
      })
    );
  }

}
