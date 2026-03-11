namespace csharp_p2.src.Shared.Pagination;

public sealed class PaginatedResult<T> {
  public required IReadOnlyList<T> Data { get; init; }
  public int Total { get; init; }
  public int Page { get; init; }
  public int Limit { get; init; }
}

