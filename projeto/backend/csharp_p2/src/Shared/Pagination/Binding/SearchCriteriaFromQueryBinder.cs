using System.Reflection;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace csharp_p2.src.Shared.Pagination;

public sealed class SearchCriteriaFromQueryBinder : IModelBinder {
  private static readonly HashSet<string> _reservedKeys = new(StringComparer.OrdinalIgnoreCase) {
    "sort-field",
    "sort-order",
    "page",
    "limit"
  };

  public Task BindModelAsync(ModelBindingContext bindingContext) {
    var modelType = bindingContext.ModelType;
    if (!IsSearchCriteriaRequest(modelType)) {
      bindingContext.Result = ModelBindingResult.Failed();
      return Task.CompletedTask;
    }

    var query = bindingContext.HttpContext.Request.Query;

    var where = new List<FilterCriteria>();
    var sort = new List<SortCriteria>();

    var sortField = query["sort-field"].ToString();
    var sortOrder = query["sort-order"].ToString();
    if (!string.IsNullOrWhiteSpace(sortField) || !string.IsNullOrWhiteSpace(sortOrder)) {
      sort.Add(new SortCriteria {
        Field = sortField ?? string.Empty,
        Order = string.IsNullOrWhiteSpace(sortOrder) ? "asc" : sortOrder
      });
    }

    var page = TryParseInt(query["page"].ToString());
    var limit = TryParseInt(query["limit"].ToString());
    var pagination = new PaginationCriteria {
      Page = page > 0 ? page : 1,
      Limit = limit > 0 ? limit : 25
    };

    foreach (var kvp in query) {
      var key = kvp.Key;
      if (_reservedKeys.Contains(key)) continue;

      var value = kvp.Value.Count > 1
        ? string.Join(",", kvp.Value)
        : kvp.Value.ToString();

      if (string.IsNullOrWhiteSpace(value)) continue;

      where.Add(new FilterCriteria {
        Field = key,
        Value = value,
        Operator = "like",
        IsNegated = false
      });
    }

    var instance = Activator.CreateInstance(modelType);
    if (instance is null) {
      bindingContext.Result = ModelBindingResult.Failed();
      return Task.CompletedTask;
    }

    SetProperty(instance, "Where", where);
    SetProperty(instance, "Sort", sort);
    SetProperty(instance, "Pagination", pagination);

    bindingContext.Result = ModelBindingResult.Success(instance);
    return Task.CompletedTask;
  }

  private static bool IsSearchCriteriaRequest(Type type) {
    return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(SearchCriteriaRequest<>);
  }

  private static int TryParseInt(string value) {
    return int.TryParse(value, out var result) ? result : 0;
  }

  private static void SetProperty(object target, string propertyName, object value) {
    var prop = target.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
    prop?.SetValue(target, value);
  }
}

