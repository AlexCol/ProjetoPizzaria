using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Helpers;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Auth.Authentication;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
  private readonly IAuthService _authService;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly CookiesHandler _cookiesHandler;

  public AuthController(IAuthService authService, ISessionCacheService sessionCacheService, CookiesHandler cookiesHandler) {
    _authService = authService;
    _sessionCacheService = sessionCacheService;
    _cookiesHandler = cookiesHandler;
  }

  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginDto loginDto) {
    var auth = await _authService.Login(loginDto);

    Request.Headers.TryGetValue("remember-me", out var rememberMeValue);
    var rememberMe = bool.TryParse(rememberMeValue.ToString(), out var parsed) && parsed;

    _cookiesHandler.AddSessionCookies(Response, auth.SessionToken, rememberMe);

    return Ok(auth.UserSessionPayload);
  }

  [HttpPost("logout")]
  public async Task<IActionResult> Logout() {
    var haveToken = Request.Cookies.TryGetValue("session_token", out var token) && !string.IsNullOrWhiteSpace(token);
    if (haveToken) {
      await _sessionCacheService.DestroySessionAsync(token);
    }

    _cookiesHandler.DeleteSessionCookies(Response);
    return NoContent();
  }
}
