namespace csharp_p2.src.Shared.Pagination;

public sealed class FilterCriteria {
  public string Field { get; init; }
  public object Value { get; init; }
  public string Operator { get; init; }
  public bool IsNegated { get; init; } = false;
}

