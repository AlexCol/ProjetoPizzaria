using csharp_p2.src.Config;
using csharp_p2.src.Config.Builder;
using csharp_p2.src.Shared.Constants;

namespace csharp_p2.src.Shared.Helpers;

[Injectable(typeof(CookiesHandler), EServiceLifetimeType.Scoped)]
public class CookiesHandler {
  private readonly EnvConfig _envConfig;

  public CookiesHandler(EnvConfig envConfig) {
    _envConfig = envConfig;
  }

  public void AddSessionCookies(HttpResponse response, string token, bool rememberMe) {
    var cookieOptions = GetSessionCookieOptions(rememberMe);
    response.Cookies.Append(SessionConstants.SESSION_TOKEN, token, cookieOptions);
  }

  public CookieOptions GetSessionCookieOptions(bool rememberMe) {
    var isProd = _envConfig.IsProduction;
    var usesSecureCookies = !_envConfig.IsDevelopment;
    return new CookieOptions {
      HttpOnly = true,
      Secure = usesSecureCookies,
      SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax,
      Expires = rememberMe ? DateTime.UtcNow.AddSeconds(_envConfig.Cache.SessionTtlInSec) : (DateTime?)null
    };
  }

  public void DeleteSessionCookies(HttpResponse response) {
    var cookieOptions = GetSessionCookieOptions(false);
    cookieOptions.Expires = DateTime.UtcNow.AddDays(-1); // Define uma data de expiração no passado
    response.Cookies.Append(SessionConstants.SESSION_TOKEN, "", cookieOptions);
  }
}
