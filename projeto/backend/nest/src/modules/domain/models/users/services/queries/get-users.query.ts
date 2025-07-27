import { BaseQuery } from "src/modules/domain/common/query/base-query";

export interface GetUserFilters {
  id?: number;
  email?: string;
  active?: boolean;
  permission?: string;
  search?: string;
}

export class GetUsersQuery extends BaseQuery<GetUserFilters> {
  // ✅ Não precisa de constructor! Herda tudo do BaseQuery
}