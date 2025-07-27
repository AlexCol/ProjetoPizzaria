import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const TokenPayloadParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    //return request[REQUEST_TOKEN_PAYLOAD_KEY];
    return request.tokenPayload; // Acessa o payload do token armazenado na requisição
  },
);
