using System.Collections;
using System.Linq.Expressions;
using System.Reflection;

namespace csharp_p2.src.Shared.Pagination;

public static partial class DynamicQuerying {
  private static IQueryable<T> ApplyFilter<T>(this IQueryable<T> query, SearchCriteriaRequest<T> criteria) {
    foreach (var filter in criteria.Where) {
      if (string.IsNullOrWhiteSpace(filter.Field)) continue;

      var property = typeof(T).GetProperty(
        filter.Field,
        BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase
      );

      if (property is null) continue;

      var parameter = Expression.Parameter(typeof(T), "x");
      var member = Expression.Property(parameter, property);
      var op = (filter.Operator ?? "=").Trim().ToLowerInvariant();

      Expression predicate = op switch {
        "like" => BuildLike(member, filter.Value),
        "in" => BuildIn(member, filter.Value),
        "!=" or "<>" or ">" or "<" or ">=" or "<=" or "=" or "==" => BuildComparison(member, op, filter.Value),
        _ => BuildComparison(member, "=", filter.Value)
      };

      if (predicate is null) continue;

      if (filter.IsNegated) {
        predicate = Expression.Not(predicate);
      }

      var lambda = Expression.Lambda<Func<T, bool>>(predicate, parameter);
      query = query.Where(lambda);
    }

    return query;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!metodo para comparação de operadores diretos (=, !=, >, <, etc)
  #region operadores diretos
  private static Expression BuildComparison(Expression member, string op, object value) {
    if (value is null) {
      if (op is "=" or "==") return Expression.Equal(member, Expression.Constant(null, member.Type));
      if (op is "!=" or "<>") return Expression.NotEqual(member, Expression.Constant(null, member.Type));
      return null;
    }

    var targetType = GetTargetType(member.Type);
    var typedValue = ChangeType(value, targetType);
    var constant = Expression.Constant(typedValue, targetType);
    var left = member.Type == targetType ? member : Expression.Convert(member, targetType);

    return op switch {
      "=" or "==" => Expression.Equal(left, constant),
      "!=" or "<>" => Expression.NotEqual(left, constant),
      ">" => Expression.GreaterThan(left, constant),
      "<" => Expression.LessThan(left, constant),
      ">=" => Expression.GreaterThanOrEqual(left, constant),
      "<=" => Expression.LessThanOrEqual(left, constant),
      _ => Expression.Equal(left, constant)
    };
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!metodo para operador like, que faz uma comparação de substring ignorando maiúsculas/minúsculas
  #region operador like
  private static Expression BuildLike(Expression member, object value) {
    if (value is JsonElement json) {
      if (json.ValueKind != JsonValueKind.String) {
        throw new ArgumentException("LIKE exige valor do tipo string.");
      }
      value = json.GetString();
    }

    if (value is not string s) {
      throw new ArgumentException("LIKE exige valor do tipo string.");
    }

    if (member.Type != typeof(string)) {
      throw new ArgumentException("LIKE so pode ser usado em campos do tipo string.");
    }

    var toLower = typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes);
    var contains = typeof(string).GetMethod(nameof(string.Contains), new[] { typeof(string) });

    var left = Expression.Call(member, toLower!);
    var right = Expression.Constant(s.ToLowerInvariant());
    return Expression.Call(left, contains!, right);
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!metodo para operador in, que verifica se o valor do campo está contido em uma coleção de valores
  #region operador in
  private static Expression BuildIn(Expression member, object value) {
    if (value is JsonElement json) {
      if (json.ValueKind != JsonValueKind.Array) {
        throw new ArgumentException("IN exige um array de valores.");
      }

      var items = new List<object>();
      foreach (var el in json.EnumerateArray()) {
        items.Add(UnwrapJsonElement(el));
      }
      value = items;
    }

    if (value is not IEnumerable enumerable || value is string) {
      throw new ArgumentException("IN exige um array de valores.");
    }

    var targetType = GetTargetType(member.Type);
    var list = new List<object>();
    foreach (var item in enumerable) {
      if (item is not null) {
        list.Add(ChangeType(item, targetType));
      }
    }

    var array = Array.CreateInstance(targetType, list.Count);
    for (var i = 0; i < list.Count; i++) {
      array.SetValue(list[i], i);
    }

    var containsMethod = typeof(Enumerable)
      .GetMethods()
      .Single(m => m.Name == nameof(Enumerable.Contains) && m.GetParameters().Length == 2)
      .MakeGenericMethod(targetType);

    var constant = Expression.Constant(array, array.GetType());
    var left = member.Type == targetType ? member : Expression.Convert(member, targetType);
    return Expression.Call(null, containsMethod, constant, left);
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!metodos auxiliares
  #region auxiliares
  //? metodo para lidar com tipos anuláveis, retornando o tipo subjacente se for anulável, ou o tipo original caso contrário
  //? exemplo: se o tipo for int?, retorna int; se for string, retorna string
  private static Type GetTargetType(Type type) {
    return Nullable.GetUnderlyingType(type) ?? type;
  }

  private static object ChangeType(object value, Type targetType) {
    value = UnwrapJsonElement(value);

    if (targetType.IsEnum) {
      return Enum.Parse(targetType, value.ToString() ?? string.Empty, true);
    }

    if (targetType == typeof(Guid)) {
      return Guid.Parse(value.ToString() ?? string.Empty);
    }

    return Convert.ChangeType(value, targetType);
  }

  private static object UnwrapJsonElement(object value) {
    if (value is not JsonElement json) {
      return value;
    }

    return json.ValueKind switch {
      JsonValueKind.String => json.GetString() ?? string.Empty,
      JsonValueKind.Number => json.TryGetInt64(out var l) ? l : json.GetDecimal(),
      JsonValueKind.True => true,
      JsonValueKind.False => false,
      JsonValueKind.Null => null,
      JsonValueKind.Array => json,
      _ => json.ToString()
    };
  }
  #endregion
}
