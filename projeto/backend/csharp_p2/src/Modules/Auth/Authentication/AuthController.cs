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

  /**************************************************************************/
  #region Login
  /**************************************************************************/
  [AllowAnonymous]
  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginDto loginDto) {
    var auth = await _authService.Login(loginDto);

    var appOrigin = Request.GetEntryPoint();
    if (appOrigin == "mobile") {
      return Ok(new { auth.UserSessionPayload, auth.SessionToken }); // Para mobile, retornamos o token no corpo da resposta (sem cookies)
    }

    var rememberMeValue = Request.GetHeaderValue("remember-me");
    var rememberMe = bool.TryParse(rememberMeValue, out var parsed) && parsed;

    _cookiesHandler.AddSessionCookies(Response, auth.SessionToken, rememberMe);

    return Ok(auth.UserSessionPayload);
  }
  #endregion

  /**************************************************************************/
  #region Logout
  /**************************************************************************/
  [HttpPost("logout")]
  public async Task<IActionResult> Logout() {
    var token = HttpContext.GetSessionToken();
    var haveToken = !string.IsNullOrWhiteSpace(token);
    if (haveToken) {
      await _sessionCacheService.DestroySessionAsync(token);
    }

    _cookiesHandler.DeleteSessionCookies(Response);
    return NoContent();
  }

  [HttpPost("logout/all")]
  public async Task<IActionResult> LogoutAll() {
    var session = HttpContext.GetSessionPayload();
    if (session != null) {
      await _sessionCacheService.DestroySessionsByUserIdAsync(session.User.Id);
    }

    _cookiesHandler.DeleteSessionCookies(Response);
    return NoContent();
  }
  #endregion

  /**************************************************************************/
  #region Session/Me
  /**************************************************************************/
  [HttpGet("session")]
  public async Task<IActionResult> GetSession() {
    var token = HttpContext.GetSessionToken();
    var haveToken = !string.IsNullOrWhiteSpace(token);
    if (!haveToken) {
      return Unauthorized();
    }

    var session = await _sessionCacheService.GetSessionAsync(token);
    if (session == null) {
      return Unauthorized();
    }

    return Ok(session.Payload);
  }
  #endregion

  /**************************************************************************/
  #region Admin-only endpoint
  /**************************************************************************/
  [Authorize(Roles = "Admin")]
  [HttpPost("logout/all-users")]
  public async Task<IActionResult> LogoutAllUsers() {
    await _sessionCacheService.DestroyAllSessionsAsync();
    return NoContent();
  }
  #endregion
}
