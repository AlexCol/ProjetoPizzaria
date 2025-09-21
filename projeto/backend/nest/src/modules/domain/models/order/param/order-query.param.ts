// base-query.param.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const OrderQueryParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const query = request.query as any; // ✅ Cast para any

    if (!query) return {};

    const {
      id,
      table,
      status,
      user_id: userId,
      draft,
      name,
      product_id: productId,
      full_data: fullData
    } = query; // ✅ Destructuring sem conversão de tipos

    return {
      id,
      table,
      status,
      userId,
      draft,
      name,
      productId,
      fullData
    };
  },
);

export interface GetOrderFilters {
  id?: number;
  table?: string;
  status?: string;
  userId?: number;
  draft?: boolean;
  name?: string;
  productId?: number; // Adicionado para filtrar por produto
  fullData?: boolean; //adicionado para controlar se trás os itens junto ou só o 'cabçalho' do pedido
}