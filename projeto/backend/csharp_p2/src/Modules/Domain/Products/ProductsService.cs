using csharp_p2.src.Modules.Infra.FileManager;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Pagination;

namespace csharp_p2.src.Modules.Domain;

public interface IProductsService {
  Task<IEnumerable<Product>> GetAllProductsAsync(EProductStatus? status);
  Task<Product> GetProductByIdAsync(long id);
  Task<PaginatedResult<Product>> GetProductsWithSearchCriteriaAsync(SearchCriteriaRequest<Product> searchCriteria);
  Task<Product> CreateProductAsync(CreateProductDto dto, IFormFile image);
  Task<MessageDto> UpdateProductAsync(long id, UpdateProductDto product, IFormFile image);
  Task DeleteProductAsync(long id);
}

public class ProductsService : IProductsService {
  private readonly IGenericEntityRepository<Product> _repository;
  private readonly IFileManager _fileManager;
  private readonly IServiceProvider _serviceProvider;

  public ProductsService(IGenericEntityRepository<Product> repository, IFileManager fileManager, IServiceProvider serviceProvider) {
    _repository = repository;
    _fileManager = fileManager;
    _serviceProvider = serviceProvider;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<IEnumerable<Product>> GetAllProductsAsync(EProductStatus? disabled) {
    if (disabled.HasValue) {
      return await _repository.SearchWithPredicateAsync(p => p.Status == disabled.Value);
    }
    return await _repository.GetAllAsync();
  }

  public async Task<Product> GetProductByIdAsync(long id) {
    return await _repository.GetByIdWithReferencesAsync(id)
      ?? throw new CustomError("Product not found", 404);
  }

  public async Task<PaginatedResult<Product>> GetProductsWithSearchCriteriaAsync(SearchCriteriaRequest<Product> searchCriteria) {
    var products = await _repository.GetWithSearchCriteriaAsync(searchCriteria);
    return products;
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<Product> CreateProductAsync(CreateProductDto dto, IFormFile image) {
    await ValidateProductCreationAsync(dto);
    var product = await SaveProductAsync(dto);
    await SaveImageAsync(image, product);
    return product;
  }

  private async Task ValidateProductCreationAsync(CreateProductDto dto) {
    await ValidateCategoryExistsAsync(dto.CategoryId);

    var existingProducts = await _repository.FindOneWithPredicateAsync(p => p.Name == dto.Name);
    if (existingProducts != null) {
      throw new CustomError("Product with the same name already exists", 400);
    }
  }

  private async Task<Product> SaveProductAsync(CreateProductDto dto) {
    var product = new Product {
      Name = dto.Name,
      Price = dto.Price,
      Description = dto.Description,
      CategoryId = dto.CategoryId
    };
    await _repository.InsertAsync(product);
    return product;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  public async Task<MessageDto> UpdateProductAsync(long id, UpdateProductDto dto, IFormFile image) {
    var product = await _repository.GetByIdAsync(id);
    if (product == null) {
      throw new CustomError("Product not found", 404);
    }

    await ValidateProductUpdateAsync(id, dto);
    await UpdateProductAsync(dto, product);
    await SaveImageAsync(image, product);

    return new MessageDto("Product updated successfully");
  }

  private async Task ValidateProductUpdateAsync(long id, UpdateProductDto dto) {
    if (dto.CategoryId is not null) {
      await ValidateCategoryExistsAsync(dto.CategoryId.Value);
    }

    var existingProducts = await _repository.FindOneWithPredicateAsync(p => p.Name == dto.Name && p.Id != id);
    if (existingProducts != null) {
      throw new CustomError("Product with the same name already exists", 400);
    }
  }

  private async Task UpdateProductAsync(UpdateProductDto dto, Product existingProduct) {
    var needUpdate = false;

    if (dto.Name != null && dto.Name != existingProduct.Name) {
      existingProduct.Name = dto.Name;
      needUpdate = true;
    }
    if (dto.Price.HasValue) {
      existingProduct.Price = dto.Price.Value;
      needUpdate = true;
    }
    if (dto.Description != null) {
      existingProduct.Description = dto.Description;
      needUpdate = true;
    }
    if (dto.Status.HasValue) {
      existingProduct.Status = dto.Status.Value;
      needUpdate = true;
    }
    if (dto.CategoryId.HasValue) {
      existingProduct.CategoryId = dto.CategoryId.Value;
      needUpdate = true;
    }

    if (needUpdate) {
      await _repository.UpdateAsync(existingProduct);
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task DeleteProductAsync(long id) {
    var trx = await _repository.BeginTransactionAsync();
    try {
      var product = await _repository.GetByIdAsync(id);
      if (product == null)
        throw new CustomError("Product not found", 404);

      var orderItemRepo = _serviceProvider.GetRequiredService<IGenericEntityRepository<OrderItem>>();
      var ordersWithItem = await orderItemRepo.FindOneWithPredicateAsync(oi => oi.ProductId == product.Id);
      if (ordersWithItem != null)
        throw new CustomError("Cannot delete product that is part of an order", 400);

      await _repository.DeleteAsync(product.Id);
      if (product.Banner is not null) {
        await _fileManager.DeleteAsync("products", product.Banner);
      }
      await trx.CommitAsync();
    } catch {
      await trx.RollbackAsync();
      throw;
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!PRIVATES
  private async Task ValidateCategoryExistsAsync(long categoryId) {
    var categoriesService = _serviceProvider.GetRequiredService<ICategoriesService>();
    await categoriesService.GetCategoryByIdAsync(categoryId);
  }

  private async Task SaveImageAsync(IFormFile image, Product product) {
    if (image == null) {
      return;
    }
    try {
      var ext = Path.GetExtension(image.FileName);
      var fileName = $"{product.Id}{ext}";
      var modulePath = $"products";
      using var stream = image.OpenReadStream();

      // Delete and save must not run concurrently. During an update they usually
      // target the same product id, so a late delete could remove the new image.
      if (product.Banner != null) {
        await _fileManager.DeleteAsync(modulePath, product.Banner);
      }
      await _fileManager.SaveAsync(modulePath, fileName, stream);
      product.Banner = fileName;

      await _repository.UpdateAsync(product);
    } catch (Exception ex) {
      //não travar a criação do produto se a imagem falhar, apenas logar o erro
      Log.Error($"Failed to save product image: {ex.Message}");
    }
  }
}
