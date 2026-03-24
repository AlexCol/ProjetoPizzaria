using csharp_p2.src.Modules.Session;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Shared.Extensions;

public static class HttpContextExtensions {
  public static UserSessionPayload GetSessionPayload(this HttpContext context) {
    return context.Items.TryGetValue("session_payload", out var obj)
           && obj is UserSessionPayload payload
      ? payload
      : null;
  }

  public static string GetSessionToken(this HttpContext context) {
    if (context.Items.TryGetValue("session_token", out var token) && token is string sessionToken) {
      return sessionToken;
    }
    return null;
  }

  public static bool IsPublicEndpoint(this HttpContext context) {
    var endpoint = context.GetEndpoint();
    return endpoint?.Metadata.GetMetadata<AllowAnonymousAttribute>() != null;
  }
}
