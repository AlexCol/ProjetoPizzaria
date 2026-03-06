using csharp_p2.src.Shared.DTOs;
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

  [Authorize(Roles = "Admin")]
  [HttpPost]
  public async Task<IActionResult> CreateRoleAsync([FromBody] RoleDto dto) {
    var createdRole = await _rolesService.CreateRoleAsync(dto);
    return CreatedAtRoute("GetRoleById", new { id = createdRole.Id }, createdRole);
  }

  [Authorize(Roles = "Admin")]
  [HttpPatch("{id}")]
  public async Task<IActionResult> UpdateRoleAsync(long id, [FromBody] RoleDto dto) {
    var updatedRole = await _rolesService.UpdateRoleAsync(id, dto);
    return Ok(updatedRole);
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteRoleAsync(long id) {
    var deleted = await _rolesService.DeleteRoleAsync(id);
    if (!deleted) return NotFound();
    return NoContent();
  }
}
