using csharp_p2.src.Shared.DTOs;

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
  public async Task<ActionResult<IEnumerable<Product>>> GetAll() {
    var products = await _service.GetAllProductsAsync();
    return Ok(products);
  }

  [HttpGet("{id}")]
  [EndpointSummary("Get product by id")]
  [EndpointDescription("Returns a single product by its id")]
  [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<Product>> GetById(long id) {
    var product = await _service.GetProductByIdAsync(id);
    if (product == null) {
      return NotFound(new ErrorResponseDto("Product not found"));
    }
    return Ok(product);
  }

  [HttpPost]
  [EndpointSummary("Create a new product")]
  [EndpointDescription("Creates a new product with the provided data")]
  [ProducesResponseType(typeof(Product), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<Product>> Create([FromForm] CreateProductDto dto, IFormFile image) {
    var product = await _service.CreateProductAsync(dto, image);
    return Ok(product);
  }
}
