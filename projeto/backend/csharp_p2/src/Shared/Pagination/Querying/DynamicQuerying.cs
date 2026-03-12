namespace csharp_p2.src.Shared.Pagination;

public static partial class DynamicQuerying {
  public static IQueryable<T> ApplySearch<T>(
    this IQueryable<T> query,
    SearchCriteriaRequest<T> criteria
  ) {
    if (criteria.Where != null && criteria.Where.Any())
      query = ApplyFilter(query, criteria);

    if (criteria.Sort != null && criteria.Sort.Any())
      query = ApplySort(query, criteria);

    if (criteria.Pagination != null)
      query = ApplyPagination(query, criteria.Pagination);

    return query;
  }
}
