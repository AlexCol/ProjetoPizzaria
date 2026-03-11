// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Linq.Expressions;
// using csharp_p2.src.Shared.Pagination;

// namespace csharp_p2.src.Shared.Pagination.Querying;

// public static class DynamicFilterBuilder {
//   /***********************************************************************/
//   /* Metodos Publicos                                                    */
//   /***********************************************************************/
//   public static IQueryable<T> ApplyFilters<T>(
//     IQueryable<T> query,
//     IEnumerable<FilterCriteria> filters,
//     IReadOnlyDictionary<string, Expression<Func<T, object>>> fieldMap
//   ) {
//     foreach (var filter in filters) {
//       if (!fieldMap.TryGetValue(filter.Field, out var expr)) {
//         continue;
//       }

//       query = ApplySingleFilter(query, expr, filter);
//     }

//     return query;
//   }

//   /***********************************************************************/
//   /* Metodos Privados Auxiliares                                         */
//   /***********************************************************************/
//   private static IQueryable<T> ApplySingleFilter<T>(
//     IQueryable<T> query,
//     Expression<Func<T, object>> expr,
//     FilterCriteria filter
//   ) {
//     var op = (filter.Operator ?? "=").Trim().ToLowerInvariant();

//     if (op == "like" && filter.Value is string s) {
//       return query.Where(BuildContains(expr, s, filter.IsNegated));
//     }

//     if (op == "in") {
//       return query.Where(BuildIn(expr, filter.Value, filter.IsNegated));
//     }

//     return query.Where(BuildComparison(expr, op, filter.Value, filter.IsNegated));
//   }

//   private static Expression<Func<T, bool>> BuildComparison<T>(
//     Expression<Func<T, object>> expr,
//     string op,
//     object value,
//     bool negated
//   ) {
//     var parameter = expr.Parameters[0];
//     var member = UnwrapConvert(expr.Body);
//     var targetType = GetTargetType(member.Type);

//     if (value is null) {
//       if (op is "=" or "==" or "!=") {
//         var nullConstant = Expression.Constant(null, member.Type);
//         Expression nullBody = op == "!="
//           ? Expression.NotEqual(member, nullConstant)
//           : Expression.Equal(member, nullConstant);
//         if (negated) nullBody = Expression.Not(nullBody);
//         return Expression.Lambda<Func<T, bool>>(nullBody, parameter);
//       }

//       return _ => true;
//     }

//     var typedValue = ChangeType(value, targetType);
//     var constant = Expression.Constant(typedValue, targetType);
//     var left = member.Type == targetType ? member : Expression.Convert(member, targetType);

//     Expression body = op switch {
//       "=" or "==" => Expression.Equal(left, constant),
//       "!=" or "<>" => Expression.NotEqual(left, constant),
//       ">" => Expression.GreaterThan(left, constant),
//       "<" => Expression.LessThan(left, constant),
//       ">=" => Expression.GreaterThanOrEqual(left, constant),
//       "<=" => Expression.LessThanOrEqual(left, constant),
//       _ => Expression.Equal(left, constant)
//     };

//     if (negated) {
//       body = Expression.Not(body);
//     }

//     return Expression.Lambda<Func<T, bool>>(body, parameter);
//   }

//   private static Expression<Func<T, bool>> BuildIn<T>(
//     Expression<Func<T, object>> expr,
//     object value,
//     bool negated
//   ) {
//     var parameter = expr.Parameters[0];
//     var member = UnwrapConvert(expr.Body);
//     var targetType = GetTargetType(member.Type);

//     if (value is not System.Collections.IEnumerable enumerable || value is string) {
//       return _ => true;
//     }

//     var list = new List<object>();
//     foreach (var item in enumerable) {
//       if (item is not null) {
//         list.Add(ChangeType(item, targetType));
//       }
//     }

//     var array = Array.CreateInstance(targetType, list.Count);
//     for (var i = 0; i < list.Count; i++) {
//       array.SetValue(list[i], i);
//     }

//     var containsMethod = typeof(Enumerable)
//       .GetMethods()
//       .Single(m => m.Name == nameof(Enumerable.Contains) && m.GetParameters().Length == 2)
//       .MakeGenericMethod(targetType);

//     var constant = Expression.Constant(array, array.GetType());
//     var left = member.Type == targetType ? member : Expression.Convert(member, targetType);
//     Expression body = Expression.Call(null, containsMethod, constant, left);

//     if (negated) {
//       body = Expression.Not(body);
//     }

//     return Expression.Lambda<Func<T, bool>>(body, parameter);
//   }

//   private static Expression<Func<T, bool>> BuildContains<T>(
//     Expression<Func<T, object>> expr,
//     string value,
//     bool negated
//   ) {
//     var parameter = expr.Parameters[0];
//     var member = UnwrapConvert(expr.Body);

//     if (member.Type != typeof(string)) {
//       return _ => true;
//     }

//     var toLower = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!;
//     var contains = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) })!;

//     var left = Expression.Call(member, toLower);
//     var right = Expression.Constant(value.ToLowerInvariant());
//     Expression body = Expression.Call(left, contains, right);

//     if (negated) {
//       body = Expression.Not(body);
//     }

//     return Expression.Lambda<Func<T, bool>>(body, parameter);
//   }

//   private static Type GetTargetType(Type type) {
//     return Nullable.GetUnderlyingType(type) ?? type;
//   }

//   private static object ChangeType(object value, Type targetType) {
//     if (targetType.IsEnum) {
//       return Enum.Parse(targetType, value.ToString() ?? string.Empty, true);
//     }

//     if (targetType == typeof(Guid)) {
//       return Guid.Parse(value.ToString() ?? string.Empty);
//     }

//     return Convert.ChangeType(value, targetType);
//   }

//   private static Expression UnwrapConvert(Expression expression) {
//     if (expression is UnaryExpression unary && unary.NodeType == ExpressionType.Convert) {
//       return unary.Operand;
//     }

//     return expression;
//   }
// }
