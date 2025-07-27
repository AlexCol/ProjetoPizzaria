// base-query.ts
import { IQuery } from '@nestjs/cqrs';
import { PaginationParams } from '../types/pagination-params';
import { SortParams } from '../types/sort-params';

export class BaseQuery<TFilters = any> implements IQuery {
  constructor(
    public readonly filters: TFilters,
    public readonly pagination?: PaginationParams,
    public readonly sort?: SortParams,
  ) { }

  // ✅ Método estático factory para criar queries facilmente
  static create<T>(
    filters?: T,
    pagination?: PaginationParams,
    sort?: SortParams
  ) {
    return new this(filters, pagination, sort);
  }
}