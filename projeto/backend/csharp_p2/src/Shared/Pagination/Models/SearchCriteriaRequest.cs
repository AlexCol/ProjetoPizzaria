namespace csharp_p2.src.Shared.Pagination;

public sealed class SearchCriteriaRequest<T> {
  public List<FilterCriteria> Where { get; init; }
  public List<SortCriteria> Sort { get; init; }
  public PaginationCriteria Pagination { get; init; }
}
