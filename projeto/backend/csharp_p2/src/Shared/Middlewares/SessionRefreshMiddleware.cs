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
    var endpoint = context.GetEndpoint();

    var isPublic = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;
    if (isPublic) {
      await _next(context);
      return;
    }

    var sessionToken = context.Request.GetTokenFromRequest(); // Usa a extensão para obter o token de forma unificada (header para mobile, cookie para web)
    if (string.IsNullOrWhiteSpace(sessionToken)) {
      throw new UnauthorizedAccessException("Session token is missing.");
    }

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
