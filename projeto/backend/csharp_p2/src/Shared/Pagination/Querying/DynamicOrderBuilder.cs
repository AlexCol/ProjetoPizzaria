// using System.Linq.Expressions;

// namespace csharp_p2.src.Shared.Pagination.Querying;

// public static class DynamicOrderBuilder {
//   public static IQueryable<T> ApplySort<T>(
//     IQueryable<T> query,
//     IEnumerable<SortCriteria> sortCriteria,
//     IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap
//   ) {
//     IOrderedQueryable<T> ordered = null;

//     foreach (var sort in sortCriteria) {
//       if (!fieldMap.TryGetValue(sort.Field, out var expr)) {
//         continue;
//       }

//       var desc = string.Equals(sort.Order, "desc", StringComparison.OrdinalIgnoreCase);

//       if (ordered is null) {
//         ordered = desc ? query.OrderByDescending(expr) : query.OrderBy(expr);
//       } else {
//         ordered = desc ? ordered.ThenByDescending(expr) : ordered.ThenBy(expr);
//       }
//     }

//     return ordered ?? query;
//   }
// }
