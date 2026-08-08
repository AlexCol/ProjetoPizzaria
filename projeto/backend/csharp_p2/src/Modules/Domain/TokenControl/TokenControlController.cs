using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class TokenControlController : ControllerBase {
  private readonly ITokenControlService _tokenControlService;

  public TokenControlController(ITokenControlService tokenControlService) {
    _tokenControlService = tokenControlService;
  }

  [AllowAnonymous]
  [HttpGet("is-token-valid/{token}")]
  public async Task<IActionResult> IsTokenValidAsync(string token) {
    try {
      if (string.IsNullOrEmpty(token)) {
        return BadRequest(new { message = "Token is required." });
      }

      var tokenControl = await _tokenControlService.GetTokenControlByTokenAsync(token);
      return Ok();
    } catch {
      return BadRequest(new { message = "Invalid token." });
    }
  }
}
