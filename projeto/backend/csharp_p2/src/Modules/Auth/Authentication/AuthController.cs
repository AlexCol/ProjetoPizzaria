using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Atributtes;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Helpers;
using csharp_p2.src.Shared.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.RateLimiting;

namespace csharp_p2.src.Modules.Auth.Authentication;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
  private readonly IAuthService _authService;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly CookiesHandler _cookiesHandler;
  private readonly IAntiforgery _antiforgery;

  public AuthController(
    IAuthService authService,
    ISessionCacheService sessionCacheService,
    CookiesHandler cookiesHandler,
    IAntiforgery antiforgery
  ) {
    _authService = authService;
    _sessionCacheService = sessionCacheService;
    _cookiesHandler = cookiesHandler;
    _antiforgery = antiforgery;
  }

  /**************************************************************************/
  #region Login-Web
  /**************************************************************************/
  [AllowAnonymous]
  [RequireCsrfProtection]
  [EnableRateLimiting(RateLimitPolicies.LOGIN)]
  [HttpPost("login")]
  [EndpointSummary("Login do usuário")]
  [EndpointDescription("Permite que um usuário faça login, retornando os detalhes da sessão. Cookies Http adicionado com Token da sessão.")]
  [ProducesResponseType(typeof(UserSessionPayload), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status429TooManyRequests)]
  public async Task<IActionResult> LoginAsync([FromBody] LoginDto loginDto) {
    var appOrigin = Request.GetEntryPoint();
    if (appOrigin != "web")
      throw new CustomError("Este endpoint é destinado apenas para aplicativos web. Use /api/auth/login-app para mobile.");

    var rememberMeValue = Request.GetHeaderValue("remember-me");
    var rememberMe = bool.TryParse(rememberMeValue, out var parsed) && parsed;

    var loginOptions = new SessionOptionsDto(
      RememberMe: rememberMe,
      AppOrigin: appOrigin
    );

    var auth = await _authService.LoginAsync(loginDto, loginOptions);

    _cookiesHandler.AddSessionCookies(Response, auth.SessionToken, rememberMe);
    return Ok(auth.UserSessionPayload);
  }
  #endregion

  /**************************************************************************/
  #region CSRF
  /**************************************************************************/
  [AllowAnonymous]
  [HttpGet("csrf-token")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  [EndpointSummary("Obter token de proteção CSRF")]
  [ProducesResponseType(typeof(CsrfTokenDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public IActionResult GetCsrfToken() {
    var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
    var requestToken = tokens.RequestToken
      ?? throw new InvalidOperationException("Failed to generate the CSRF request token.");

    return Ok(new CsrfTokenDto(requestToken));
  }
  #endregion

  /**************************************************************************/
  #region Login-App
  /**************************************************************************/
  [AllowAnonymous]
  [EnableRateLimiting(RateLimitPolicies.LOGIN)]
  [HttpPost("login-app")]
  [EndpointSummary("Login para aplicativos móveis")]
  [EndpointDescription("Permite que usuários façam login a partir de aplicativos móveis, retornando um token de sessão no corpo da resposta.")]
  [ProducesResponseType(typeof(MobileLoginResponseDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status429TooManyRequests)]
  public async Task<IActionResult> LoginAppAsync([FromBody] LoginDto loginDto) {
    var appOrigin = Request.GetEntryPoint();
    if (appOrigin != "mobile")
      throw new CustomError("Este endpoint é destinado apenas para aplicativos móveis. Use /api/auth/login para web.");

    var loginOptions = new SessionOptionsDto(
      RememberMe: false,
      AppOrigin: appOrigin
    );

    var auth = await _authService.LoginAsync(loginDto, loginOptions);
    var response = new MobileLoginResponseDto {
      UserSessionPayload = auth.UserSessionPayload,
      SessionToken = auth.SessionToken
    };
    return Ok(response);
  }
  #endregion

  /**************************************************************************/
  #region Logout-Self
  /**************************************************************************/
  [HttpPost("logout")]
  [EndpointSummary("Logout da sessão atual.")]
  [EndpointDescription("Permite que o usuário faça logout da sessão atual, destruindo o token associado.")]
  [ProducesResponseType(typeof(void), StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<IActionResult> LogoutAsync() {
    var token = HttpContext.GetSessionToken();
    var haveToken = !string.IsNullOrWhiteSpace(token);
    if (haveToken) {
      await _sessionCacheService.DestroySessionAsync(token);
    }

    _cookiesHandler.DeleteSessionCookies(Response);
    return NoContent();
  }
  #endregion

  /**************************************************************************/
  #region Logout-All
  /**************************************************************************/
  [HttpPost("logout/all")]
  [EndpointSummary("Logout de todas as sessões do usuário atual.")]
  [EndpointDescription("Permite que o usuário faça logout de todas as suas sessões ativas.")]
  [ProducesResponseType(typeof(void), StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<IActionResult> LogoutAllAsync() {
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
  [EndpointSummary("Obter os detalhes da sessão atual.")]
  [ProducesResponseType(typeof(UserSessionPayload), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(void), StatusCodes.Status401Unauthorized)]
  public async Task<IActionResult> GetSessionAsync() {
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
  [EndpointSummary("Logout de todos os usuários")]
  [EndpointDescription("Permite que um administrador faça logout de todos os usuários, destruindo todas as sessões ativas.")]
  [ProducesResponseType(typeof(void), StatusCodes.Status204NoContent)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(void), StatusCodes.Status403Forbidden)]
  public async Task<IActionResult> LogoutAllUsersAsync() {
    await _sessionCacheService.DestroyAllSessionsAsync();
    return NoContent();
  }

  [Authorize(Roles = "Admin")]
  [HttpGet("session/list-active")]
  [EndpointSummary("Listar todas as sessões ativas")]
  [EndpointDescription("Permite que um administrador liste todas as sessões ativas.")]
  [ProducesResponseType(typeof(SessionsPerUserRecordDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(void), StatusCodes.Status403Forbidden)]
  public async Task<IActionResult> ListActiveSessionsAsync() {
    var sessions = await _sessionCacheService.GetActiveSessionsCountPerUserAsync();
    return Ok(sessions);
  }
  #endregion
}
