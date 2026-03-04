using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.Helpers;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Shared.Middlewares;

public class SessionRefreshMiddleware {
  private readonly RequestDelegate _next;

  public SessionRefreshMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(
    HttpContext context,
    ISessionCacheService sessionService,
    CookiesHandler cookiesHandler
  ) {
    // Early return: endpoint público
    var endpoint = context.GetEndpoint();
    var isPublic = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;
    if (isPublic) {
      await _next(context);
      return;
    }

    // Early return: sem token (tem que barrar na autenticação, não é função do middleware)
    var sessionToken = context.Request.GetCookieValue("session_token");
    if (string.IsNullOrWhiteSpace(sessionToken)) {
      await _next(context);
      return;
    }

    // Tenta renovar sessão
    try {
      var refreshed = await sessionService.RefreshSessionAsync(sessionToken);

      if (refreshed) {
        var rememberMeValue = context.Request.GetHeaderValue("remember-me");
        var rememberMe = bool.TryParse(rememberMeValue, out var parsed) && parsed;

        cookiesHandler.AddSessionCookies(context.Response, sessionToken, rememberMe);
      }
    } catch {
      cookiesHandler.DeleteSessionCookies(context.Response);
      throw;
    }

    await _next(context);
  }
}
