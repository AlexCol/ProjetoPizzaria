namespace csharp_p2.src.Modules.Sse;

public record SseMessage(ESseEvents Event, object Data);
public record SseMessageDto(string Event, object Data);

public record SseSessionData(string Message, object NewPayload = null);
public record SseSystemData(string Message, string Type); // info|warning|error

public enum ESseEvents {
  SessionRevoked,
  SessionUpdated,
  UserSessionsRevoked,
  AllSessionsRevoked,
  SystemNotification,
  OrderStatusChanged
}
