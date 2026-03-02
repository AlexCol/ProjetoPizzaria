using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Shared.DTOs.Roles;

namespace csharp_p2.src.Modules.Domain.Roles;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase {
  private readonly IRolesService _rolesService;

  public RolesController(IRolesService rolesService) {
    _rolesService = rolesService;
  }

  [HttpGet("{id}", Name = "GetRoleById")]
  public async Task<IActionResult> GetRoleByIdAsync(long id) {
    var role = await _rolesService.GetRoleByIdAsync(id);
    if (role == null) return NotFound();
    return Ok(role);
  }

  [HttpGet]
  public async Task<IActionResult> GetAllRolesAsync() {
    var roles = await _rolesService.GetAllRolesAsync();
    return Ok(roles);
  }

  [HttpPost]
  public async Task<IActionResult> CreateRoleAsync([FromBody] RoleDto dto) {
    var createdRole = await _rolesService.CreateRoleAsync(dto);
    return CreatedAtRoute("GetRoleById", new { id = createdRole.Id }, createdRole);
  }

  [HttpPatch("{id}")]
  public async Task<IActionResult> UpdateRoleAsync(long id, [FromBody] RoleDto dto) {
    var updatedRole = await _rolesService.UpdateRoleAsync(id, dto);
    return Ok(updatedRole);
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteRoleAsync(long id) {
    var deleted = await _rolesService.DeleteRoleAsync(id);
    if (!deleted) return NotFound();
    return NoContent();
  }
}
