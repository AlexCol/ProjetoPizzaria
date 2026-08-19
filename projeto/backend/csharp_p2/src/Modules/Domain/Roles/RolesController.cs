using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Pagination;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase {
  private readonly IRolesService _rolesService;

  public RolesController(IRolesService rolesService) {
    _rolesService = rolesService;
  }

  [HttpGet("{id}", Name = "GetRoleById")]
  [EndpointSummary("Obter Role por ID")]
  [EndpointDescription("Retorna uma role pelo seu ID.")]
  [ProducesResponseType(typeof(ResponseRoleDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> GetRoleByIdAsync(long id) {
    var role = await _rolesService.GetRoleByIdAsync(id);
    return Ok(new ResponseRoleDto(role));
  }

  [HttpGet()]
  [EndpointSummary("Obter Todas as Roles.")]
  [EndpointDescription("Retorna uma lista de todas as roles.")]
  [ProducesResponseType(typeof(IEnumerable<ResponseRoleDto>), StatusCodes.Status200OK)]
  public async Task<IActionResult> GetAllRolesAsync() {
    var roles = await _rolesService.GetAllRolesAsync();
    return Ok(roles.Select(role => new ResponseRoleDto(role)));
  }

  [HttpGet("search")]
  [EndpointSummary("Obter Todas as Roles com Filtros na Query.")]
  [EndpointDescription("Retorna uma lista de todas as roles, aplicando filtros enviados na query.")]
  [ProducesResponseType(typeof(PaginatedResult<ResponseRoleDto>), StatusCodes.Status200OK)]
  public async Task<IActionResult> GetRolesWithFiltersAsync(
  [FromQuery] SearchCriteriaRequest<Role> searchCriteria
) {
    var roles = await _rolesService.GetRolesWithSearchCriteriaAsync(searchCriteria);
    return Ok(ToResponse(roles));
  }

  [HttpPost("search")]
  [EndpointSummary("Obter Todas as Roles com Filtros no Corpo.")]
  [EndpointDescription("Retorna uma lista de todas as roles, aplicando filtros enviados no corpo da requisição.")]
  [ProducesResponseType(typeof(PaginatedResult<ResponseRoleDto>), StatusCodes.Status200OK)]
  public async Task<IActionResult> PostAllRolesWithFiltersAsync(
    [FromBody] SearchCriteriaRequest<Role> searchCriteria
  ) {
    var roles = await _rolesService.GetRolesWithSearchCriteriaAsync(searchCriteria);
    return Ok(ToResponse(roles));
  }

  [Authorize(Roles = "Admin")]
  [HttpPost]
  [EndpointSummary("Criar Role")]
  [EndpointDescription("Cria uma nova role.")]
  [ProducesResponseType(typeof(ResponseRoleDto), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> CreateRoleAsync([FromBody] RoleDto dto) {
    var createdRole = await _rolesService.CreateRoleAsync(dto);
    return CreatedAtRoute("GetRoleById", new { id = createdRole.Id }, new ResponseRoleDto(createdRole));
  }

  [Authorize(Roles = "Admin")]
  [HttpPatch("{id}")]
  [EndpointSummary("Atualizar Role")]
  [EndpointDescription("Atualiza uma role existente.")]
  [ProducesResponseType(typeof(ResponseRoleDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> UpdateRoleAsync(long id, [FromBody] RoleDto dto) {
    var updatedRole = await _rolesService.UpdateRoleAsync(id, dto);
    return Ok(new ResponseRoleDto(updatedRole));
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("{id}")]
  [EndpointSummary("Deletar Role")]
  [EndpointDescription("Deleta uma role existente.")]
  [ProducesResponseType(StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> DeleteRoleAsync(long id) {
    var deleted = await _rolesService.DeleteRoleAsync(id);
    if (!deleted) return NotFound();
    return NoContent();
  }

  private static PaginatedResult<ResponseRoleDto> ToResponse(PaginatedResult<Role> roles) {
    return new PaginatedResult<ResponseRoleDto> {
      Data = roles.Data.Select(role => new ResponseRoleDto(role)).ToList(),
      Total = roles.Total,
      Page = roles.Page,
      Limit = roles.Limit,
    };
  }
}
