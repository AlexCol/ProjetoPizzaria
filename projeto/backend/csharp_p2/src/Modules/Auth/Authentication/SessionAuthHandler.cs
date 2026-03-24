using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Modules.Auth.Authentication;

public static class SessionAuthDefaults {
  public const string SCHEME = "SessionToken";
}

public class SessionAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions> {
  private readonly ISessionCacheService _sessionCache;

  public SessionAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ISessionCacheService sessionCache
  ) : base(options, logger, encoder) {
    _sessionCache = sessionCache;
  }

  protected override async Task<AuthenticateResult> HandleAuthenticateAsync() {
    var token = Request.GetTokenFromRequest(); // Usa a extensão para obter o token de forma unificada (header para mobile, cookie para web)
    if (string.IsNullOrWhiteSpace(token)) {
      return AuthenticateResult.NoResult();
    }

    var session = await _sessionCache.GetSessionAsync(token);
    if (session is null)
      throw new CustomError("Invalid session token, no session found for the provided token.", 401);

    var entryPoint = Request.GetEntryPoint();
    if (entryPoint != session.Options.AppOrigin) {
      throw new CustomError("Token origin mismatch, The token's origin does not match the request's origin.", 401);
    }

    var claims = new List<Claim>
    {
      new(ClaimTypes.NameIdentifier, session.Payload.User.Id.ToString()),
      new(ClaimTypes.Email, session.Payload.User.Email),
      new(ClaimTypes.Name, session.Payload.User.Name),
      new(ClaimTypes.Role, session.Payload.User.Role?.Name ?? "")
    };

    var identity = new ClaimsIdentity(claims, SessionAuthDefaults.SCHEME);
    var principal = new ClaimsPrincipal(identity);
    var ticket = new AuthenticationTicket(principal, SessionAuthDefaults.SCHEME);

    Context.Items["session_payload"] = session.Payload; // equivalente ao req.user.payload
    Context.Items["session_token"] = token; // armazena o token no contexto para uso posterior (ex: logout)
    return AuthenticateResult.Success(ticket);
  }

  protected override Task HandleChallengeAsync(AuthenticationProperties properties) {
    Response.Cookies.Delete("session_token");
    return base.HandleChallengeAsync(properties);
  }
}
