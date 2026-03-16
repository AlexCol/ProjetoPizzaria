using System.Collections;
using FluentValidation;

namespace csharp_p2.src.Shared.Pagination;

public class SearchCriteriaRequestValidator<T> : AbstractValidator<SearchCriteriaRequest<T>> {
  private static readonly HashSet<string> _allowedOperators = new(StringComparer.OrdinalIgnoreCase) {
    "=", "!=", ">", "<", ">=", "<=", "in", "like"
  };

  public SearchCriteriaRequestValidator() {
    var allowedFields = typeof(T).GetProperties().Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);

    //! Validação para Paginação
    RuleFor(x => x.Pagination!.Page)
      .GreaterThanOrEqualTo(1)
      .WithMessage("Page deve ser maior ou igual a 1")
      .When(x => x.Pagination is not null);

    RuleFor(x => x.Pagination!.Limit)
      .InclusiveBetween(1, 200)
      .WithMessage("Limit deve ser entre 1 e 200")
      .When(x => x.Pagination is not null);

    //! Validação para Ordenação
    RuleForEach(x => x.Sort!)
      .ChildRules(sort => {
        sort.RuleFor(s => s.Field)
          .NotEmpty()
          .WithMessage(f => $"Sort field {f.Field} nao pode ser vazio")
          .Must(f => allowedFields.Contains(f))
          .WithMessage(f => $"Sort field {f.Field} invalido");

        sort.RuleFor(s => s.Order)
          .Must(o => o.Equals("asc", StringComparison.OrdinalIgnoreCase)
                 || o.Equals("desc", StringComparison.OrdinalIgnoreCase))
          .WithMessage("Sort order deve ser asc ou desc");
      })
      .When(x => x.Sort is not null);

    //! Validação para Filtros
    RuleForEach(x => x.Where!)
      .ChildRules(filter => {
        filter.RuleFor(f => f.Field)
          .NotEmpty()
          .WithMessage(f => $"Field {f.Field} nao pode ser vazio")
          .Must(f => allowedFields.Contains(f))
          .WithMessage(f => $"Field {f.Field} invalido");

        filter.RuleFor(f => f.Value)
          .NotEmpty()
          .WithMessage(f => $"Value para o field {f.Field} nao pode ser vazio")
          .Must((filtro, value) => {
            var isIn = string.Equals(filtro.Operator, "in", StringComparison.OrdinalIgnoreCase);
            if (!isIn) return true;

            if (value is null) return false;

            if (value is JsonElement je) // Quando vem do JSON como object, normalmente chega como JsonElement
              return je.ValueKind == JsonValueKind.Array;

            if (value is string) return false; // string implementa IEnumerable, mas nao deve ser aceita como array para operador in

            return value is IEnumerable;
          })
          .WithMessage(f => $"Quando Operator for 'in', Value para o field {f.Field} deve ser um array");

        filter.RuleFor(f => f.Operator)
          .Must(op => op is null || _allowedOperators.Contains(op))
          .WithMessage(f => $"Operator para o field {f.Field} invalido");
      })
      .When(x => x.Where is not null);
  }
}
