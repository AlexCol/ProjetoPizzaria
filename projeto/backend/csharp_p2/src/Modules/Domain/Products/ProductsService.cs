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

  public ProductsService(IGenericEntityRepository<Product> repository, IFileManager fileManager) {
    _repository = repository;
    _fileManager = fileManager;
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
    var product = new Product {
      Name = dto.Name,
      Price = dto.Price,
      Description = dto.Description,
      CategoryId = dto.CategoryId
    };
    await _repository.InsertAsync(product);

    if (image != null && image.Length > 0) {
      var ext = Path.GetExtension(image.FileName);
      var fileName = $"{product.Id}{ext}";
      var modulePath = $"products";
      using var stream = image.OpenReadStream();
      await _fileManager.SaveAsync(modulePath, fileName, stream);
      product.Banner = fileName;

      await _repository.UpdateAsync(product);
    }

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
}
