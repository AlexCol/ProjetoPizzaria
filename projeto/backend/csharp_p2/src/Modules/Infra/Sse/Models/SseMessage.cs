namespace csharp_p2.src.Modules.Infra.Sse;

public record SseMessage(string Event, object Data);

public record SseSessionData(string Message, object NewPayload = null);
public record SseSystemData(string Message, string Type); // info|warning|error

public static class SseEvents {
  public const string SessionRevoked = "session-revoked";
  public const string SessionUpdated = "session-updated";
  public const string UserSessionsRevoked = "user-sessions-revoked";
  public const string AllSessionsRevoked = "all-sessions-revoked";
  public const string SystemNotification = "system-notification";
}
