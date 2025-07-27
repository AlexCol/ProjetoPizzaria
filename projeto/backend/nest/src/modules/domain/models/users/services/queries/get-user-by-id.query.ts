import { BaseQuery } from "src/modules/domain/common/query/base-query";

export interface GetUserByIdFilters {
  id: number;
}

export class GetUserByIdQuery extends BaseQuery<GetUserByIdFilters> {
  // ✅ Não precisa de constructor! Herda tudo do BaseQuery
}