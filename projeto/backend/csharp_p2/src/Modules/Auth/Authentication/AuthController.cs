using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Helpers;

namespace csharp_p2.src.Modules.Auth.Authentication;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
  private readonly IAuthService _authService;
  private readonly CookiesHandler _cookiesHandler;

  public AuthController(IAuthService authService, CookiesHandler cookiesHandler) {
    _authService = authService;
    _cookiesHandler = cookiesHandler;
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginDto loginDto) {
    var auth = await _authService.Login(loginDto);

    Request.Headers.TryGetValue("remember-me", out var rememberMeValue);
    var rememberMe = bool.TryParse(rememberMeValue.ToString(), out var parsed) && parsed;

    _cookiesHandler.AddSessionCookies(Response, auth.SessionToken, rememberMe);

    return Ok(auth.UserSessionPayload);
  }
}
