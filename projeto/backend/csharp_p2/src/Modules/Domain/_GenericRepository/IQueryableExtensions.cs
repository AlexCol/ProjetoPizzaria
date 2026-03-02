using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using csharp_p2.src.Modules.Entities;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

public static class IQueryableExtensions {
  public static IQueryable<T> IncludeAll<T>(this IQueryable<T> query) where T : BaseEntityWithId {
    return IncludeRelatedEntities(query, typeof(T), new HashSet<string>());
  }

  private static IQueryable<T> IncludeRelatedEntities<T>(IQueryable<T> query, Type entityType, HashSet<string> includedProperties) where T : class {
    var navigationProperties = entityType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                        .Where(p => p.PropertyType.IsClass &&
                                                    p.PropertyType != typeof(string) &&
                                                    p.GetCustomAttribute<NotMappedAttribute>() == null &&
                                                    typeof(BaseEntityWithId).IsAssignableFrom(p.PropertyType));

    foreach (var property in navigationProperties) {
      var propertyName = property.Name;
      if (!includedProperties.Contains(propertyName)) {
        includedProperties.Add(propertyName);
        query = query.Include(propertyName);

        // Inclui propriedades de navegação aninhadas
        var propertyType = property.PropertyType;
        if (typeof(BaseEntityWithId).IsAssignableFrom(propertyType)) {
          var includePath = propertyName;
          query = IncludeNestedRelatedEntities(query, propertyType, includePath, includedProperties);
        }
      }
    }
    return query;
  }

  private static IQueryable<T> IncludeNestedRelatedEntities<T>(IQueryable<T> query, Type entityType, string parentPath, HashSet<string> includedProperties) where T : class {
    var navigationProperties = entityType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                                        .Where(p => p.PropertyType.IsClass &&
                                                    p.PropertyType != typeof(string) &&
                                                    p.GetCustomAttribute<NotMappedAttribute>() == null &&
                                                    typeof(BaseEntityWithId).IsAssignableFrom(p.PropertyType));

    foreach (var property in navigationProperties) {
      var propertyName = $"{parentPath}.{property.Name}";
      if (!includedProperties.Contains(propertyName)) {
        includedProperties.Add(propertyName);
        query = query.Include(propertyName);

        // Inclui propriedades de navegação aninhadas recursivamente
        var propertyType = property.PropertyType;
        if (typeof(BaseEntityWithId).IsAssignableFrom(propertyType)) {
          query = IncludeNestedRelatedEntities(query, propertyType, propertyName, includedProperties);
        }
      }
    }
    return query;
  }
}
