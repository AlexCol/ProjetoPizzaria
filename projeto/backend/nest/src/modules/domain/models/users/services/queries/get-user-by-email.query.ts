import { BaseQuery } from "src/modules/domain/common/query/base-query";

export interface GetUserByEmailFilters {
  email: string;
}

export class GetUserByEmailQuery extends BaseQuery<GetUserByEmailFilters> {
  // ✅ Não precisa de constructor! Herda tudo do BaseQuery
}