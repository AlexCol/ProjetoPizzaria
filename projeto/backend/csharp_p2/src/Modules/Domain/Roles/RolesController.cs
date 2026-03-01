using csharp_p2.src.Modules.Entities;

namespace csharp_p2.src.Modules.Domain.Roles;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase {
  private readonly IRolesService _rolesService;

  public RolesController(IRolesService rolesService) {
    _rolesService = rolesService;
  }

  [HttpPost]
  public async Task<IActionResult> CreateRoleAsync([FromBody] Role role) {
    try {
      var createdRole = await _rolesService.CreateRoleAsync(role);
      return CreatedAtRoute("GetRoleById", new { id = createdRole.Id }, createdRole);
    } catch (Exception ex) {
      return BadRequest(ex.Message);
    }
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

  [HttpPatch("{id}")]
  public async Task<IActionResult> UpdateRoleAsync(long id, [FromBody] Role role) {
    try {
      role.Id = id; //garante que o id da rota seja o mesmo do objeto
      var updatedRole = await _rolesService.UpdateRoleAsync(role);
      return Ok(updatedRole);
    } catch (Exception ex) {
      return BadRequest(ex.Message);
    }
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteRoleAsync(long id) {
    try {
      var deleted = await _rolesService.DeleteRoleAsync(id);
      if (!deleted) return NotFound();
      return NoContent();
    } catch (Exception ex) {
      return BadRequest(ex.Message);
    }
  }
}
