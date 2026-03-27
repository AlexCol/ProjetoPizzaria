export type PaginatedDtoResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
