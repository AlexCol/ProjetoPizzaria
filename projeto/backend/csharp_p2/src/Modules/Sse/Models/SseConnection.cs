namespace csharp_p2.src.Modules.Sse;

public class SseConnection {
  public string UserId { get; init; } = string.Empty;
  public HttpResponse Response { get; init; } = default!;
  public string ConnectionId { get; init; } = string.Empty;
  public SemaphoreSlim WriteLock { get; } = new(1, 1);
  public CancellationTokenSource HeartbeatCts { get; set; } = new();
}
