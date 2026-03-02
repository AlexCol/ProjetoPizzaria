using csharp_p2.src.Shared.DTOs.Login;

namespace csharp_p2.src.Modules.Auth.Authentication;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
  [HttpPost]
  public IActionResult Login([FromBody] LoginDto loginDto) {

    return Ok();
  }
}
