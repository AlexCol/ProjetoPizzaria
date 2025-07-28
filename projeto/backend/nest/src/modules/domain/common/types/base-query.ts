import { PaginationParams } from "./pagination-params";
import { SortParams } from "./sort-params";

export type BaseQueryType<T> = {
  filters?: T;
  pagination?: PaginationParams;
  sort?: SortParams;
}