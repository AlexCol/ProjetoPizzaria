using System.Linq.Expressions;
using csharp_p2.src.Modules.Infra.Database.builders;
using csharp_p2.src.Modules.Entities;

namespace csharp_p2.src.Modules.Domain;

public interface IGenericEntityRepository<T> where T : BaseEntityWithId {
  BaseDBContext GetContext();
  Task<T> GetByIdAsync(long id);
  Task<T> GetByIdWithReferencesAsync(long id);
  Task<IEnumerable<T>> GetAllAsync(int page = 1, int pageSize = 20);
  Task<T> FindOneWithPredicateAsync(Expression<Func<T, bool>> predicate);
  Task<T> FindOneWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate);
  Task<IEnumerable<T>> SearchWithPredicateAsync(Expression<Func<T, bool>> predicate, int page = 1, int pageSize = 20);
  Task<IEnumerable<T>> SearchWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate, int page = 1, int pageSize = 20);
  Task<T> FindByEntityAsync(T entity);
  Task<T> InsertAsync(T obj);
  Task<List<T>> InsertsAsync(IEnumerable<T> objs);
  Task<bool> UpdateAsync(T obj);
  Task<bool> DeleteAsync(long id);
}
