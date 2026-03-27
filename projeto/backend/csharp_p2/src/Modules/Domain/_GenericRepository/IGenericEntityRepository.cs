using System.Linq.Expressions;
using csharp_p2.src.Shared.Pagination;
using Microsoft.EntityFrameworkCore.Storage;

namespace csharp_p2.src.Modules.Domain;

public interface IGenericEntityRepository<T> where T : BaseEntityWithId {
  //BaseDBContext GetContext();
  Task<IDbContextTransaction> BeginTransactionAsync();

  Task<PaginatedResult<T>> GetWithSearchCriteriaAsync(SearchCriteriaRequest<T> criteria);
  Task<PaginatedResult<T>> GetWithSearchCriteriaWithReferencesAsync(SearchCriteriaRequest<T> criteria);

  Task<T> GetByIdAsync(long id);
  Task<T> GetByIdWithReferencesAsync(long id);

  Task<IEnumerable<T>> GetAllAsync();
  Task<IEnumerable<T>> GetAllWithReferencesAsync();

  Task<T> FindOneWithPredicateAsync(Expression<Func<T, bool>> predicate);
  Task<T> FindOneWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate);

  Task<IEnumerable<T>> SearchWithPredicateAsync(Expression<Func<T, bool>> predicate);
  Task<IEnumerable<T>> SearchWithPredicateWithReferencesAsync(Expression<Func<T, bool>> predicate);

  Task<T> FindByEntityAsync(T entity);

  Task<T> InsertAsync(T obj);
  Task<List<T>> InsertsAsync(IEnumerable<T> objs);

  Task<bool> UpdateAsync(T obj);

  Task<bool> DeleteAsync(long id);
}
