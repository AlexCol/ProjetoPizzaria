using csharp_p2.src.Config;
using csharp_p2.src.Config.builder.DI.Atributes;
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Shared.Helpers;

[Injectable(typeof(CookiesHandler), EServiceLifetimeType.Scoped)]
public class CookiesHandler {
  public readonly EnvConfig _envConfig;

  public CookiesHandler(EnvConfig envConfig) {
    _envConfig = envConfig;
  }

  public void AddSessionCookies(HttpResponse response, string token, bool rememberMe) {
    var cookieOptions = GetSessionCookieOptions(rememberMe);
    response.Cookies.Append("session_token", token, cookieOptions);
  }

  public CookieOptions GetSessionCookieOptions(bool rememberMe) {
    var isProd = _envConfig.Environment == "Production";
    return new CookieOptions {
      HttpOnly = true,
      Secure = isProd,
      SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax,
      Expires = rememberMe ? DateTime.UtcNow.AddDays(7) : (DateTime?)null
    };
  }
}
