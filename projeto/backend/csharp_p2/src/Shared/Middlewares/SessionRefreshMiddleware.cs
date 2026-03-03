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
    // Verifica se o endpoint é [AllowAnonymous]
    var endpoint = context.GetEndpoint();
    var isPublic = endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;

    if (!isPublic) {
      var sessionToken = context.Request.Cookies["session_token"];

      if (!string.IsNullOrWhiteSpace(sessionToken)) {
        try {
          var refreshed = await sessionService.RefreshSessionAsync(sessionToken);

          if (refreshed) {
            context.Request.Headers.TryGetValue("remember-me", out var rememberMeValue);
            var rememberMe = bool.TryParse(rememberMeValue.ToString(), out var parsed) && parsed;

            cookiesHandler.AddSessionCookies(context.Response, sessionToken, rememberMe);
          }
        } catch {
          cookiesHandler.DeleteSessionCookies(context.Response);
          throw;
        }
      }
    }

    await _next(context);
  }
}
