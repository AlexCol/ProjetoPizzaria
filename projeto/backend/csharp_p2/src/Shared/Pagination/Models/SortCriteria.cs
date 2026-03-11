namespace csharp_p2.src.Shared.Pagination;

public sealed class SortCriteria {
  public required string Field { get; init; }
  public required string Order { get; init; }
}

