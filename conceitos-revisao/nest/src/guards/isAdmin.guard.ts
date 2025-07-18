import { BadRequestException, CanActivate, ExecutionContext, Injectable, MisdirectedException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log(' 🛡️ IsAdminGuard chamado.');

    //console.log('context.getClass():', context.getClass());
    //console.log('context.getHandler():', context.getHandler());

    //const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(), //pra checar se o decorator está na rota (metodo)
      context.getClass(), //pra checar se o decorator está no controller (classe)
    ]);
    if (isPublic) {
      return true; // Se for público, permite o acesso sem autenticação
    }

    /* logica de autenticação para dar return true senão cai no return false e bloqueia */
    //!pode-se user esse abaixo para caso o token não seja valido ou não informado, de modo a ofuscar a rota e gerar confusão em possiveis atacantes
    //!para jwt vencido, pode-se usar o UnauthorizedException
    const random = Math.random();
    if (random < 0.5) {
      throw new MisdirectedException('Não autenticado ou não autorizado.');
    }
    throw new UnauthorizedException('Token inválido ou expirado.');
  }

}
