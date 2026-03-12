using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Pagination;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain.Roles;

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
  [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<IActionResult> GetRoleByIdAsync(long id) {
    var role = await _rolesService.GetRoleByIdAsync(id);
    if (role == null) return NotFound();
    return Ok(role);
  }

  [HttpGet()]
  [EndpointSummary("Obter Todas as Roles.")]
  [EndpointDescription("Retorna uma lista de todas as roles.")]
  [ProducesResponseType(typeof(IEnumerable<RoleDto>), StatusCodes.Status200OK)]
  public async Task<IActionResult> GetAllRolesAsync() {
    var roles = await _rolesService.GetAllRolesAsync();
    return Ok(roles);
  }

  [HttpGet("search")]
  [EndpointSummary("Obter Todas as Roles com Filtros na Query.")]
  [EndpointDescription("Retorna uma lista de todas as roles, aplicando filtros enviados na query.")]
  [ProducesResponseType(typeof(PaginatedResult<Role>), StatusCodes.Status200OK)]
  public async Task<IActionResult> GetRolesWithFiltersAsync(
  [FromQuery] SearchCriteriaRequest<Role> searchCriteria
) {
    var roles = await _rolesService.GetRolesWithSearchCriteriaAsync(searchCriteria);
    return Ok(roles);
  }

  [HttpPost("search")]
  [EndpointSummary("Obter Todas as Roles com Filtros no Corpo.")]
  [EndpointDescription("Retorna uma lista de todas as roles, aplicando filtros enviados no corpo da requisição.")]
  [ProducesResponseType(typeof(PaginatedResult<Role>), StatusCodes.Status200OK)]
  public async Task<IActionResult> PostAllRolesWithFiltersAsync(
    [FromBody] SearchCriteriaRequest<Role> searchCriteria
  ) {
    var roles = await _rolesService.GetRolesWithSearchCriteriaAsync(searchCriteria);
    return Ok(roles);
  }

  [Authorize(Roles = "Admin")]
  [HttpPost]
  [EndpointSummary("Criar Role")]
  [EndpointDescription("Cria uma nova role.")]
  [ProducesResponseType(typeof(RoleDto), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> CreateRoleAsync([FromBody] RoleDto dto) {
    var createdRole = await _rolesService.CreateRoleAsync(dto);
    return CreatedAtRoute("GetRoleById", new { id = createdRole.Id }, createdRole);
  }

  [Authorize(Roles = "Admin")]
  [HttpPatch("{id}")]
  [EndpointSummary("Atualizar Role")]
  [EndpointDescription("Atualiza uma role existente.")]
  [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> UpdateRoleAsync(long id, [FromBody] RoleDto dto) {
    var updatedRole = await _rolesService.UpdateRoleAsync(id, dto);
    return Ok(updatedRole);
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
}
