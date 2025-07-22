import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { Reflector } from "@nestjs/core";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../contants/auth.constants";
import { Permission } from "src/common/enums/permissao.enum";
import { TokenPayloadDto } from "../dto/token-payload.dto";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // Injetando o refletor para acessar metadados
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const needsPermission = this.reflector.get<Permission>('needsPermission', context.getHandler());
    if (!needsPermission) //se não precisar de permissão, libera o acesso
      return true;

    const token_payload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;
    if (!request[REQUEST_TOKEN_PAYLOAD_KEY]) //se não tiver o payload do token na requisição, lança uma exceção
      throw new Error('Token não encontrado. Rotas com permissão requerem um token válido.'); //para itens com persmissão, o token é obrigatório

    if (!token_payload.permissions.includes(needsPermission) && !token_payload.permissions.includes(Permission.ADMIN)) {
      throw new UnauthorizedException(`Usuário não possui permissão: ${needsPermission}`); // Se a pessoa não tiver a permissão necessária, lança uma exceção
    }

    return true; // Se o token for válido, retorna true para permitir o acesso
  }
}
