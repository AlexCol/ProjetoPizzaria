using csharp_p2.src.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
  private readonly IUsersService _usersService;

  public UsersController(IUsersService usersService) {
    _usersService = usersService;
  }

  [HttpGet]
  public async Task<ActionResult<IEnumerable<ResponseUserDto>>> GetAllUsersAsync() {
    var users = await _usersService.GetAllUsersAsync();
    return Ok(users);
  }

  [HttpGet("{id}", Name = "GetUserByIdWithReferences")]
  public async Task<ActionResult<ResponseUserDto>> GetUserByIdWithReferencesAsync(long id) {
    try {
      var user = await _usersService.GetUserByIdAsync(id);
      return Ok(user);
    } catch (Exception ex) {
      return NotFound(ex.Message);
    }
  }

  [Authorize(Roles = "Admin")]
  [HttpPost]
  public async Task<ActionResult<dynamic>> CreateUserAsync([FromBody] CreateUserDto dto) {
    await _usersService.CreateUserAsync(dto);
    return new { Message = "User created successfully. Access users email to activate the account.", };
  }
}
