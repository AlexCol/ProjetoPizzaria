using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Modules.Domain;

public interface ICategoriesService {
  Task<IEnumerable<Category>> GetAllCategoriesAsync();
  Task<Category> GetCategoryByIdAsync(long id);
  Task<string> CreateCategoryAsync(CategoriesDto category);
  Task<string> UpdateCategoryAsync(long id, CategoriesDto category);
  Task DeleteCategoryAsync(long id);
}

public class CategoriesService : ICategoriesService {
  private readonly IGenericEntityRepository<Category> _repository;
  private readonly IServiceProvider _serviceProvider;

  public CategoriesService(IGenericEntityRepository<Category> repository, IServiceProvider serviceProvider) {
    _repository = repository;
    _serviceProvider = serviceProvider;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<IEnumerable<Category>> GetAllCategoriesAsync() {
    return await _repository.GetAllAsync();
  }

  public async Task<Category> GetCategoryByIdAsync(long id) {
    return await _repository.GetByIdWithReferencesAsync(id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<string> CreateCategoryAsync(CategoriesDto dto) {
    var existingCategory = await _repository.FindOneWithPredicateAsync(c => c.Name == dto.Name);
    if (existingCategory != null) {
      throw new CustomError("Category with the same name already exists.");
    }

    var category = new Category {
      Name = dto.Name
    };

    await _repository.InsertAsync(category);
    return "Category created successfully.";
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  public async Task<string> UpdateCategoryAsync(long id, CategoriesDto dto) {
    var category = await _repository.GetByIdAsync(id);
    if (category == null) {
      throw new CustomError("Category not found.", 404);
    }

    var existingCategory = await _repository.FindOneWithPredicateAsync(c => c.Name == dto.Name && c.Id != id);
    if (existingCategory != null) {
      throw new CustomError("Another category with the same name already exists.");
    }

    category.Name = dto.Name;
    await _repository.UpdateAsync(category);
    return "Category updated successfully.";
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task DeleteCategoryAsync(long id) {
    var category = await _repository.GetByIdAsync(id);

    if (category == null) {
      throw new CustomError("Category not found.", 404);
    }

    var productRepository = _serviceProvider.GetService<IGenericEntityRepository<Product>>();
    var existingProducts = await productRepository.FindOneWithPredicateAsync(p => p.CategoryId == id);
    if (existingProducts != null) {
      throw new CustomError("Cannot delete category with associated products.");
    }

    await _repository.DeleteAsync(id);

  }
}
