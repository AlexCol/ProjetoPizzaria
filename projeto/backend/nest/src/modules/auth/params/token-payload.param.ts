import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../contants/auth.constants";

export const TokenPayloadParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    //return request[REQUEST_TOKEN_PAYLOAD_KEY];
    return request.tokenPayload; // Acessa o payload do token armazenado na requisição
  },
);
