namespace csharp_p2.src.Shared.Extensions;

public static class HttpRequestExtensions {
  public static string GetHeaderValue(this HttpRequest request, string headerName) {
    if (request.Headers.TryGetValue(headerName, out var value)) {
      return value.ToString();
    }
    return null;
  }

  public static string GetCookieValue(this HttpRequest request, string cookieName) {
    if (request.Cookies.TryGetValue(cookieName, out var value)) {
      return value;
    }
    return null;
  }

  public static string GetEntryPoint(this HttpRequest request) {
    var appOrigin = request.GetHeaderValue("app-origin");
    return appOrigin;
  }

  public static string GetTokenFromRequest(this HttpRequest request) {
    var entryPoint = request.GetEntryPoint();
    if (entryPoint == "mobile") {
      return request.Headers.Authorization.ToString();
    } else {
      return request.GetCookieValue("session_token");
    }
  }
}
