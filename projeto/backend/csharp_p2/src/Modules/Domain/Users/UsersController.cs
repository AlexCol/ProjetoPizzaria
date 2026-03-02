using csharp_p2.src.Shared.DTOs.Users;

namespace csharp_p2.src.Modules.Domain.Users;

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

  [HttpPost]
  public async Task<ActionResult<ResponseUserDto>> CreateUserAsync([FromBody] CreateUserDto dto) {
    var user = await _usersService.CreateUserAsync(dto);
    return CreatedAtAction("GetUserByIdWithReferences", new { id = user.Id }, user);
  }
}
