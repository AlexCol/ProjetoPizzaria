using FluentValidation;

namespace csharp_p2.src.Shared.Pagination;

public class SearchCriteriaRequestValidator<T> : AbstractValidator<SearchCriteriaRequest<T>> {
  private static readonly HashSet<string> _allowedOperators = new(StringComparer.OrdinalIgnoreCase) {
    "=", "!=", ">", "<", ">=", "<=", "in", "like"
  };

  public SearchCriteriaRequestValidator() {
    var allowedFields = typeof(T).GetProperties().Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

    RuleFor(x => x.Pagination!.Page)
      .GreaterThanOrEqualTo(1)
      .When(x => x.Pagination is not null);

    RuleFor(x => x.Pagination!.Limit)
      .InclusiveBetween(1, 200)
      .When(x => x.Pagination is not null);

    RuleForEach(x => x.Sort!)
      .ChildRules(sort => {
        sort.RuleFor(s => s.Field)
          .NotEmpty()
          .Must(f => allowedFields.Contains(f))
          .WithMessage("Sort field invalido");

        sort.RuleFor(s => s.Order)
          .Must(o => o.Equals("asc", StringComparison.OrdinalIgnoreCase)
                 || o.Equals("desc", StringComparison.OrdinalIgnoreCase))
          .WithMessage("Sort order deve ser asc ou desc");
      })
      .When(x => x.Sort is not null);

    RuleForEach(x => x.Where!)
      .ChildRules(filter => {
        filter.RuleFor(f => f.Field)
          .NotEmpty()
          .Must(f => allowedFields.Contains(f))
          .WithMessage("Filter field invalido");

        filter.RuleFor(f => f.Value)
          .NotEmpty()
          .WithMessage("Filter value nao pode ser vazio");

        filter.RuleFor(f => f.Operator)
          .Must(op => op is null || _allowedOperators.Contains(op))
          .WithMessage("Operator invalido");
      })
      .When(x => x.Where is not null);
  }
}
