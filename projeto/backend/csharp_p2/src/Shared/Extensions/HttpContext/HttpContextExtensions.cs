using csharp_p2.src.Modules.Session;

namespace csharp_p2.src.Shared.Extensions;

public static class HttpContextExtensions {
  public static UserSessionPayload GetSessionPayload(this HttpContext context) {
    return context.Items.TryGetValue("session_payload", out var obj)
           && obj is UserSessionPayload payload
      ? payload
      : null;
  }
}
