using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Atributtes;
using csharp_p2.src.Shared.Helpers;

namespace csharp_p2.src.Modules.Auth.Authentication;

public static class SessionAuthDefaults {
  public const string SCHEME = "SessionToken";
}

public class SessionAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions> {
  private readonly ISessionCacheService _sessionCache;
  private readonly CookiesHandler _cookiesHandler;

  public SessionAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ISessionCacheService sessionCache,
    CookiesHandler cookiesHandler
  ) : base(options, logger, encoder) {
    _sessionCache = sessionCache;
    _cookiesHandler = cookiesHandler;
  }

  protected override async Task<AuthenticateResult> HandleAuthenticateAsync() {
    var allowInference = Context
    .GetEndpoint()?
    .Metadata
    .GetMetadata<IgnoreAppOriginAttribute>() is not null;

    if (Context.IsPublicEndpoint()) // Se a rota permite acesso anônimo, não tenta autenticar e simplesmente retorna NoResult para que o pipeline continue sem um usuário autenticado.
      return AuthenticateResult.NoResult();

    var token = GetTokenFromRequestOrThrow(); // Obtém o token da requisição (header para mobile, cookie para web) e lança erro se não encontrar
    var session = await GetSessionFromRequestOrThrowAsync(token);

    if (!allowInference)
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
      throw new CustomError("Sessão inválida ou expirada.", StatusCodes.Status401Unauthorized);

    return token;
  }

  private async Task<UserSession> GetSessionFromRequestOrThrowAsync(string token) {
    var session = await _sessionCache.GetSessionAsync(token);
    if (session is null) {
      _cookiesHandler.DeleteSessionCookies(Response); // Remove o cookie de sessão inválido, se existir
      throw new CustomError("Sessão inválida ou expirada.", StatusCodes.Status401Unauthorized);
    }

    return session;
  }

  private void IsCorrectOriginOrThrow(SessionOptionsDto sessionOptions) {
    var entryPoint = Request.GetEntryPoint();
    if (entryPoint != sessionOptions.AppOrigin) {
      throw new CustomError("Sessão inválida ou expirada.", StatusCodes.Status401Unauthorized);
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
