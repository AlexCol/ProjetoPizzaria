using System.Linq.Expressions;
using System.Reflection;

namespace csharp_p2.src.Shared.Pagination;

public static partial class DynamicQuerying {
  private static IQueryable<T> ApplySort<T>(this IQueryable<T> query, SearchCriteriaRequest<T> criteria) {
    IOrderedQueryable<T> ordered = null;

    foreach (var sort in criteria.Sort) {
      if (string.IsNullOrWhiteSpace(sort.Field)) continue;

      var property = typeof(T).GetProperty(
        sort.Field,
        BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase
      );

      if (property is null) continue;

      var parameter = Expression.Parameter(typeof(T), "x");
      var member = Expression.Property(parameter, property);
      var lambda = Expression.Lambda(member, parameter);
      var isDesc = string.Equals(sort.Order, "desc", StringComparison.OrdinalIgnoreCase);

      var methodName = ordered is null
        ? (isDesc ? "OrderByDescending" : "OrderBy")
        : (isDesc ? "ThenByDescending" : "ThenBy");

      var source = ordered ?? query;
      var call = Expression.Call(
        typeof(Queryable),
        methodName,
        [typeof(T), property.PropertyType],
        source.Expression,
        Expression.Quote(lambda)
      );

      ordered = (IOrderedQueryable<T>)source.Provider.CreateQuery<T>(call);
    }

    return ordered ?? query;
  }
}
