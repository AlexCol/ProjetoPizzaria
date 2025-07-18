import { ArgumentsHost, Catch, ExceptionFilter, MisdirectedException, NotFoundException } from "@nestjs/common";
import { FastifyRequest } from "fastify";

@Catch(MisdirectedException)
export class AuthObfuscationFilter implements ExceptionFilter {
  catch(_: MisdirectedException, host: ArgumentsHost) {
    console.log('❌ AuthObfuscationFilter triggered');

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const message = `Cannot ${request.method} ${request.url} - obscured`;

    throw new NotFoundException(message);
  }
}

/*
  ✔️ VANTAGENS:
  - Oculta detalhes de autenticação, dificultando enumeração de rotas por atacantes.
  - Útil em APIs onde a existência da rota é sensível (ex: áreas administrativas).
  - Simples de implementar com ExceptionFilters do NestJS.

  ❌ DESVANTAGENS:
  - Viola a semântica correta do HTTP (401 ≠ 404).
  - Pode confundir consumidores legítimos da API e dificultar debugging.
  - Pode gerar inconsistência em testes automatizados e documentação (Swagger, etc).
  - É uma forma de "security by obscurity", que não deve ser usada como única proteção.

  ⚠️ Use apenas se houver justificativa clara de segurança. Documente bem e padronize.
*/
