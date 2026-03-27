
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq.Expressions;
using System.Reflection;
using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace csharp_p2.src.Modules.Domain;

public class GenericEntityRepository<T> : IGenericEntityRepository<T> where T : BaseEntityWithId {

  private readonly BaseDBContext _context;
  private readonly IServiceProvider _service;
  public GenericEntityRepository(BaseDBContext context, IServiceProvider service) {
    _context = context;
    _service = service;
  }

  // public BaseDBContext GetContext() {
  //   return _context;
  // }

  public async Task<IDbContextTransaction> BeginTransactionAsync() {
    return await _context.Database.BeginTransactionAsync();
  }

  public async Task<PaginatedResult<T>> GetWithSearchCriteriaAsync(SearchCriteriaRequest<T> criteria) {
    IQueryable<T> query = _context.Set<T>().AsNoTracking();
    var items = await query.ApplySearch(criteria).ToListAsync();
    if (criteria.Pagination != null) {
      var totalItems = await query.CountAsync();
      return new PaginatedResult<T> {
        Data = items,
        Total = totalItems,
        Page = criteria.Pagination.Page,
        Limit = criteria.Pagination.Limit
      };
    } else {
      return new PaginatedResult<T> {
        Data = items,
        Total = items.Count,
        Page = 1,
        Limit = items.Count
      };
    }
  }

  public async Task<PaginatedResult<T>> GetWithSearchCriteriaWithReferencesAsync(SearchCriteriaRequest<T> criteria) {
    IQueryable<T> query = _context.Set<T>().AsNoTracking().IncludeAll();
    var items = await query.ApplySearch(criteria).ToListAsync();
    if (criteria.Pagination != null) {
      var totalItems = await query.CountAsync();
      return new PaginatedResult<T> {
        Data = items,
        Total = totalItems,
        Page = criteria.Pagination.Page,
        Limit = criteria.Pagination.Limit
      };
    } else {
      return new PaginatedResult<T> {
        Data = items,
        Total = items.Count,
        Page = 1,
        Limit = items.Count
      };
    }
  }

  public async Task<T> GetByIdAsync(long id) {
    return await FindByIdAsync(id, false);
  }

  public async Task<T> GetByIdWithReferencesAsync(long id) {
    return await FindByIdAsync(id, true);
  }

  public async Task<IEnumerable<T>> GetAllAsync() {
    return await _context.Set<T>()
      .AsNoTracking()
      .ToListAsync();
  }

  public async Task<IEnumerable<T>> GetAllWithReferencesAsync() {
    return await _context.Set<T>()
      .AsNoTracking()
      .IncludeAll()
      .ToListAsync();
  }

  public async Task<T> FindOneWithPredicateAsync(Expression<Func<T, bool>> predicate) {
    return await _context.Set<T>()
      .AsNoTracking()
      .FirstOrDefaultAsync(predicate);
  }

  public async Task<T> FindOneWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate) {
    return await _context.Set<T>()
      .IncludeAll()
      .AsNoTracking()
      .FirstOrDefaultAsync(predicate);
  }

  public async Task<IEnumerable<T>> SearchWithPredicateAsync(Expression<Func<T, bool>> predicate) {
    return await _context.Set<T>()
      .AsNoTracking()
      .Where(predicate)
      .ToListAsync();
  }

  public async Task<IEnumerable<T>> SearchWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate) {
    return await _context.Set<T>()
      .AsNoTracking()
      .Where(predicate)
      .IncludeAll()
      .ToListAsync();
  }

  public async Task<T> FindByEntityAsync(T entity) {
    var entityType = _context.Model.FindEntityType(typeof(T));
    var keyProperties = entityType.FindPrimaryKey().Properties;
    var keyValues = keyProperties.Select(p => GetKeyValue(entity.GetType().GetProperty(p.Name).GetValue(entity), p.ClrType)).ToArray();
    return await _context.Set<T>().FindAsync(keyValues);
  }

  public async Task<T> InsertAsync(T obj) {
    var objToInsert = new List<T> { obj };
    var inserted = await InsertsAsync(objToInsert);
    return inserted.FirstOrDefault();
  }

  public async Task<List<T>> InsertsAsync(IEnumerable<T> objs) {
    var inseridos = new List<T>();
    foreach (var obj in objs) {
      await UpdateRelatedEntitiesAsync(obj);
      _context.Set<T>().Add(obj);
      inseridos.Add(obj);
    }
    await _context.SaveChangesAsync();
    return inseridos;
  }

  public async Task<bool> UpdateAsync(T obj) {
    var currentObj = await FindByEntityAsync(obj);
    if (currentObj == null) return false;

    // Atualiza os valores
    _context.Entry(currentObj).CurrentValues.SetValues(obj);
    await UpdateRelatedEntitiesAsync(currentObj, obj);
    await _context.SaveChangesAsync();
    return true;
  }

  public async Task<bool> DeleteAsync(long id) {
    var obj = await GetByIdAsync(id);
    if (obj == null) return false;

    _context.Remove(obj);
    await _context.SaveChangesAsync();
    return true;
  }

  // ? FIM DOS METODOS PUBLICOS
  /*
  ! Metodos Privados. Servem como processos auxiliares,
  ! Pensar se pertinente criar uma Partial para eles.
  */

  /*
  *
  * Metodos para auxilio nas Buscas
  *
  */

  private async Task<T> FindByIdAsync(object id, bool includeReferences) {
    var query = _context.Set<T>().AsNoTracking().AsQueryable();

    if (includeReferences)
      query = query.IncludeAll();

    var keyName = _context.Model.FindEntityType(typeof(T))
                                .FindPrimaryKey()
                                .Properties
                                .Select(p => p.Name)
                                .FirstOrDefault();

    if (keyName == null)
      throw new InvalidOperationException("Primary key not found.");

    var parameter = Expression.Parameter(typeof(T), "e");
    var predicate = Expression.Lambda<Func<T, bool>>(
        Expression.Equal(
            Expression.Property(parameter, keyName),
            Expression.Constant(id)
        ),
        parameter
    );
    return await query.FirstOrDefaultAsync(predicate);
  }

  private object GetKeyValue(object value, Type propertyType) {
    if (propertyType == typeof(int) && (int)value == 0) {
      return -1;
    }
    return value;
  }

  /****************************************************************************/
  /* Metodos para auxilio em Update e Insert                                  */
  /****************************************************************************/
  private async Task UpdateRelatedEntitiesAsync(T newItem) { // Atualiza as entidades relacionadas de um item novo usando o mesmo item como base
    await UpdateRelatedEntitiesAsync(newItem, newItem); // Chama a versão sobrecarregada do método passando o item novo como existente também
  }

  private async Task UpdateRelatedEntitiesAsync(T existingItem, T newItem) { // Atualiza as entidades relacionadas entre o item existente e o novo item
    var navigationProperties = GetNavigationProperties(); // Obtém todas as propriedades de navegação do tipo T que são do tipo _BaseEntityWithId

    foreach (var property in navigationProperties) { // Itera sobre cada propriedade de navegação
      var newValue = property.GetValue(newItem);
      if (newValue is BaseEntityWithId) {
        await UpdateSingleEntityAsync(existingItem, newItem, property); // Atualiza a propriedade de navegação específica
      }
    }
  }

  private IEnumerable<PropertyInfo> GetNavigationProperties() { // Obtém as propriedades de navegação do tipo T que são do tipo _BaseEntityWithId
    return typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance) // Obtém todas as propriedades públicas e de instância
        .Where(p =>
              typeof(BaseEntityWithId).IsAssignableFrom(p.PropertyType) &&
              p.GetCustomAttribute<NotMappedAttribute>() == null
        );
  }

  private async Task UpdateSingleEntityAsync(T existingItem, T newItem, PropertyInfo property) {
    var newValue = property.GetValue(newItem); // Obtém o valor da propriedade no novo item

    if (newValue != null) {
      if (newValue is BaseEntityWithId newEntity) {
        var currentEntity = await GetCurrentValueOfPropertyAsync(newEntity); // Obtém a entidade atual correspondente ao novo valor

        if (currentEntity == null) {
          //currentEntity = newEntity;
          throw new InvalidOperationException("Registro relacionado não encontrado.");

        }

        property.SetValue(existingItem, currentEntity); // Define o valor da propriedade no item existente com a entidade atualizada
      }
    }
  }

  private async Task<object> GetCurrentValueOfPropertyAsync(BaseEntityWithId newProperty) {
    var repositoryType = typeof(IGenericEntityRepository<>).MakeGenericType(newProperty.GetType()); // Obtém o tipo do repositório genérico para o tipo da nova propriedade
    var repository = _service.GetRequiredService(repositoryType); // Obtém o repositório genérico do serviço de injeção de dependência
    var method = repositoryType.GetMethod("FindByEntity"); // Obtém o método FindById do repositório

    var parameters = new object[] { newProperty }; // Prepara os parâmetros para o método FindById (neste caso, o ID da nova entidade)
    var task = (Task)method.Invoke(repository, parameters);
    await task.ConfigureAwait(false); // Invoca o método FindById de forma assíncrona
    var resultProperty = task.GetType().GetProperty("Result"); // Obtém a propriedade Result da task, que contém a entidade encontrada
    return resultProperty.GetValue(task); // Retorna o valor da entidade encontrada
  }

  /*
  ! Fundo deve conter apenas classes privadas. Se for classe publica, que está na interface, adicionar acima do comentário 'FIM DAS CLASSES PUBLICAS'
  */
}
