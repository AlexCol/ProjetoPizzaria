// base-query.param.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { PaginationParams } from "../types/pagination-params";
import { SortParams } from "../types/sort-params";

export const BaseQueryParam = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const query = request.query as any; // ✅ Cast para any

    if (!query) return {};

    // ✅ Destructuring com conversão de tipos
    const { page, limit, sort_field: sortField, sort_order: sortOrder } = query;

    return {
      pagination: {
        page: page ? Number(page) : 1,      // ✅ Convert string to number
        limit: limit ? Number(limit) : 10   // ✅ Convert string to number
      },
      sort: {
        field: sortField || 'id',           // ✅ String (já OK)
        order: sortOrder || 'ASC'           // ✅ String (já OK)
      }
    };
  },
);

export type BaseQueryParamType = {
  pagination: PaginationParams;
  sort: SortParams;
}