using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.DTOs;

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
    if (Context.IsPublicEndpoint()) // Se a rota permite acesso anônimo, não tenta autenticar e simplesmente retorna NoResult para que o pipeline continue sem um usuário autenticado.
      return AuthenticateResult.NoResult();

    var token = GetTokenFromRequestOrThrow(); // Obtém o token da requisição (header para mobile, cookie para web) e lança erro se não encontrar
    var session = await GetSessionFromRequestOrThrowAsync(token);

    IsCorrectOriginOrThrow(session.Options); // Verifica se o token é usado na origem correta (web/mobile)

    var claims = PrepareClaims(session.Payload); // Prepara as claims com base no payload da sessão (id, email, nome, role)
    var ticket = CreateAuthenticationTicket(claims); // Cria o AuthenticationTicket que representa o usuário autenticado no contexto do ASP.NET Core

    SetContextItems(session.Payload, token); // equivalente ao req.user.payload

    return AuthenticateResult.Success(ticket);
  }

  protected override Task HandleChallengeAsync(AuthenticationProperties properties) {
    Response.Cookies.Delete("session_token");
    return base.HandleChallengeAsync(properties);
  }

  /**************************************************************************/
  #region Auxiliary Methods
  /**************************************************************************/
  private string GetTokenFromRequestOrThrow() {
    var token = Request.GetTokenFromRequest();
    if (string.IsNullOrWhiteSpace(token))
      throw new UnauthorizedAccessException("Session token is missing.");

    return token;
  }

  private async Task<UserSession> GetSessionFromRequestOrThrowAsync(string token) {
    var session = await _sessionCache.GetSessionAsync(token);
    if (session is null)
      throw new CustomError("Invalid session token, no session found for the provided token.", 401);

    return session;
  }

  private void IsCorrectOriginOrThrow(SessionOptionsDto sessionOptions) {
    var entryPoint = Request.GetEntryPoint();
    if (entryPoint != sessionOptions.AppOrigin) {
      throw new CustomError("Token origin mismatch, The token's origin does not match the request's origin.", 401);
    }
  }

  private List<Claim> PrepareClaims(UserSessionPayload sessionPayload) {
    var claims = new List<Claim>
    {
      new(ClaimTypes.NameIdentifier, sessionPayload.User.Id.ToString()),
      new(ClaimTypes.Email, sessionPayload.User.Email),
      new(ClaimTypes.Name, sessionPayload.User.Name),
      new(ClaimTypes.Role, sessionPayload.User.Role?.Name ?? "")
    };
    return claims;
  }

  private AuthenticationTicket CreateAuthenticationTicket(List<Claim> claims) {
    var identity = new ClaimsIdentity(claims, SessionAuthDefaults.SCHEME);
    var principal = new ClaimsPrincipal(identity);
    return new AuthenticationTicket(principal, SessionAuthDefaults.SCHEME);
  }

  private void SetContextItems(UserSessionPayload payload, string token) {
    Context.Items["session_payload"] = payload;
    Context.Items["session_token"] = token;
  }
  #endregion
}
