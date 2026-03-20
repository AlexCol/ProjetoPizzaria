using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Filters;
using csharp_p2.src.Shared.Pagination;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain.Products;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase {
  private readonly IProductsService _service;

  public ProductsController(IProductsService service) {
    _service = service;
  }

  [HttpGet]
  [EndpointSummary("Get all products")]
  [EndpointDescription("Returns a list of all products in the system")]
  [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<IEnumerable<Product>>> GetAllAsync(
    [FromQuery] EProductStatus? status
  ) {
    var products = await _service.GetAllProductsAsync(status);
    return Ok(products);
  }

  [HttpGet("{id}")]
  [EndpointSummary("Get product by id")]
  [EndpointDescription("Returns a single product by its id")]
  [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<Product>> GetByIdAsync(long id) {
    var product = await _service.GetProductByIdAsync(id);
    if (product == null) {
      return NotFound(new ErrorResponseDto("Product not found"));
    }
    return Ok(product);
  }

  [HttpGet("search")]
  [EndpointSummary("Get products with search criteria")]
  [EndpointDescription("Returns a paginated list of products based on search criteria")]
  [ProducesResponseType(typeof(PaginatedResult<Product>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<PaginatedResult<Product>>> GetWithSearchCriteriaAsync([FromQuery] SearchCriteriaRequest<Product> searchCriteria) {
    var products = await _service.GetProductsWithSearchCriteriaAsync(searchCriteria);
    return Ok(products);
  }

  [HttpPost]
  [Authorize(Roles = "Admin")]
  [EndpointSummary("Create a new product")]
  [EndpointDescription("Creates a new product with the provided data")]
  [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [FileValidation(MaxBytes = 2 * 1024 * 1024, AllowedExtensions = [".jpg", ".png", ".jpeg"], Optional = false)]
  public async Task<ActionResult<Product>> CreateAsync([FromForm] CreateProductDto dto, IFormFile image) {
    var product = await _service.CreateProductAsync(dto, image);
    return Ok(product);
  }

  [HttpPatch("{id}")]
  [Authorize(Roles = "Admin")]
  [EndpointSummary("Update an existing product")]
  [EndpointDescription("Updates an existing product with the provided data")]
  [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  [FileValidation(MaxBytes = 2 * 1024 * 1024, AllowedExtensions = [".jpg", ".png", ".jpeg"], Optional = true)]
  public async Task<ActionResult<string>> UpdateAsync(long id, [FromForm] UpdateProductDto dto, IFormFile image) {
    var result = await _service.UpdateProductAsync(id, dto, image);
    return Ok(result);
  }

  [HttpDelete("{id}")]
  [Authorize(Roles = "Admin")]
  [EndpointSummary("Delete a product")]
  [EndpointDescription("Deletes a product by its id")]
  [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<string>> DeleteAsync(long id) {
    await _service.DeleteProductAsync(id);
    return Ok(new { message = "Product deleted successfully" });
  }
}
