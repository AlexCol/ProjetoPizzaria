namespace csharp_p2.src.Shared.Pagination;

public static partial class DynamicQuerying {
  private static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, PaginationCriteria pagination) {
    var page = pagination.Page < 1 ? 1 : pagination.Page;
    var limit = pagination.Limit < 1 ? 25 : pagination.Limit;
    if (limit > 200) limit = 200;

    var skip = (page - 1) * limit;
    return query.Skip(skip).Take(limit);
  }
}
