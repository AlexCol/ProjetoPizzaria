using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Modules.Domain.Categories;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase {
  private readonly ICategoriesService _service;

  public CategoriesController(ICategoriesService service) {
    _service = service;
  }

  [HttpGet]
  [EndpointSummary("Listar categorias")]
  [EndpointDescription("Retorna uma lista de todas as categorias cadastradas.")]
  [ProducesResponseType(typeof(IEnumerable<Category>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<IEnumerable<Category>>> GetAllCategoriesAsync() {
    var categories = await _service.GetAllCategoriesAsync();
    return Ok(categories);
  }

  [HttpGet("{id}")]
  [EndpointSummary("Buscar categoria por id")]
  [EndpointDescription("Retorna uma categoria pelo seu id.")]
  [ProducesResponseType(typeof(Category), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<Category>> GetCategoryByIdAsync(long id) {
    var category = await _service.GetCategoryByIdAsync(id);
    if (category == null) {
      return NotFound(new ErrorResponseDto("Category not found."));
    }
    return Ok(category);
  }

  [HttpPost]
  [EndpointSummary("Criar categoria")]
  [EndpointDescription("Cria uma nova categoria.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<MessageDto>> CreateCategoryAsync([FromBody] CategoriesDto dto) {
    var message = await _service.CreateCategoryAsync(dto);
    return Ok(new MessageDto(message));
  }

  [HttpPatch("{id}")]
  [EndpointSummary("Atualizar categoria")]
  [EndpointDescription("Atualiza os dados de uma categoria.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> UpdateCategoryAsync(long id, [FromBody] CategoriesDto dto) {
    var message = await _service.UpdateCategoryAsync(id, dto);
    return Ok(new MessageDto(message));
  }

  [HttpDelete("{id}")]
  [EndpointSummary("Deletar categoria")]
  [EndpointDescription("Deleta uma categoria pelo seu id.")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> DeleteCategoryAsync(long id) {
    await _service.DeleteCategoryAsync(id);
    return NoContent();
  }
}
