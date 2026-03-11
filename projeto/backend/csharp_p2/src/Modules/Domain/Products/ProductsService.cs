using csharp_p2.src.Modules.Infra.FileManager;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Modules.Domain.Products;

public interface IProductsService {
  Task<IEnumerable<Product>> GetAllProductsAsync();
  Task<Product> GetProductByIdAsync(long id);
  Task<Product> CreateProductAsync(CreateProductDto dto, IFormFile image);
  // Task<string> UpdateProductAsync(long id, ProductsDto product);
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
  public async Task<IEnumerable<Product>> GetAllProductsAsync() {
    return await _repository.GetAllAsync();
  }

  public async Task<Product> GetProductByIdAsync(long id) {
    return await _repository.GetByIdAsync(id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<Product> CreateProductAsync(CreateProductDto dto, IFormFile image) {
    await ValidateCategoryExistsAsync(dto.CategoryId);
    await ValidateProductCreationAsync(dto);
    var product = await SaveProductAsync(dto);
    await SaveImageAsync(image, product);
    return product;
  }

  private async Task ValidateProductCreationAsync(CreateProductDto dto) {
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

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task DeleteProductAsync(long id) {
    var product = await _repository.GetByIdAsync(id);
    if (product == null)
      throw new CustomError("Product not found", 404);

    var orderItemRepo = _serviceProvider.GetService<IGenericEntityRepository<OrderItem>>();
    var ordersWithItem = await orderItemRepo.FindOneWithPredicateAsync(oi => oi.ProductId == product.Id);
    if (ordersWithItem != null)
      throw new CustomError("Cannot delete product that is part of an order", 400);

    await _repository.DeleteAsync(product.Id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!PRIVATES
  private async Task ValidateCategoryExistsAsync(long categoryId) {
    var categoriesService = _serviceProvider.GetService<ICategoriesService>();
    var category = await categoriesService.GetCategoryByIdAsync(categoryId);
    if (category == null) {
      throw new CustomError("Category not found", 404);
    }
  }

  private async Task SaveImageAsync(IFormFile image, Product product) {
    var ext = Path.GetExtension(image.FileName);
    var fileName = $"{product.Id}{ext}";
    var modulePath = $"products";
    using var stream = image.OpenReadStream();
    await _fileManager.SaveAsync(modulePath, fileName, stream);
    product.Banner = fileName;

    await _repository.UpdateAsync(product);
  }
}
