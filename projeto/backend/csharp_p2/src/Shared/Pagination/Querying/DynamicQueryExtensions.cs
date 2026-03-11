// using System.Linq.Expressions;
// using Microsoft.EntityFrameworkCore;

// namespace csharp_p2.src.Shared.Pagination.Querying;

// public static class DynamicQueryExtensions {
//   public static IQueryable<T> ApplySearchCriteria<T>(
//     this IQueryable<T> query,
//     SearchCriteriaRequest criteria,
//     IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap,
//     Func<IQueryable<T>, IQueryable<T>>? extra = null
//   ) {
//     if (criteria?.Where is { Count: > 0 }) {
//       query = DynamicFilterBuilder.ApplyFilters(query, criteria.Where, fieldMap);
//     }

//     if (criteria?.Sort is { Count: > 0 }) {
//       query = DynamicOrderBuilder.ApplySort(query, criteria.Sort, fieldMap);
//     }

//     if (extra is not null) {
//       query = extra(query);
//     }

//     return query;
//   }

//   public static async Task<PaginatedResult<T>> ToPaginatedResultAsync<T>(
//     this IQueryable<T> query,
//     PaginationCriteria pagination,
//     CancellationToken ct = default
//   ) {
//     var page = pagination?.Page < 1 ? 1 : pagination.Page;
//     var limit = pagination is null || pagination.Limit is < 1 or > 200 ? 25 : pagination.Limit;
//     var skip = (page - 1) * limit;

//     var total = await query.CountAsync(ct);
//     var data = await query.Skip(skip).Take(limit).ToListAsync(ct);

//     return new PaginatedResult<T> {
//       Data = data,
//       Total = total,
//       Page = page,
//       Limit = limit
//     };
//   }
// }
