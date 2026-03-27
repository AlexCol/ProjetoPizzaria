using System.Collections.Concurrent;
using csharp_p2.src.Config.Builder;

namespace csharp_p2.src.Modules.Sse;

public interface ISseService {
  Task ConnectAsync(string userId, HttpContext context, CancellationToken ct);
  Task SendToUserAsync(string userId, ESseEvents sseEvent, object message, CancellationToken ct = default);
  Task SendToAllAsync(ESseEvents sseEvent, object message, CancellationToken ct = default);
  ActiveConnectionsDto GetActiveConnections();
  void DisconnectUser(string userId);
  ESseEvents TransformEventOrThrow(string eventName);
}

[Injectable(EServiceLifetimeType.Singleton)]
public class SseService : ISseService {
  private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, SseConnection>> _connections = new();

  #region Métodos da Interface
  /*****************************************************************************/
  /* Adiciona Conexão                                                          */
  /*****************************************************************************/
  public async Task ConnectAsync(string userId, HttpContext context, CancellationToken ct) {
    PrepareHeaders(context);

    var conn = new SseConnection {
      ConnectionId = GenerateConnectionId(),
      UserId = userId,
      Response = context.Response
    };

    var userConnections = _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, SseConnection>());
    userConnections[conn.ConnectionId] = conn;

    conn.HeartbeatCts = CancellationTokenSource.CreateLinkedTokenSource(ct, context.RequestAborted);
    var connectionToken = conn.HeartbeatCts.Token;

    await WriteRawAsync(conn, ": SSE connection established\n\n", connectionToken);

    SetHeartbeatForConnection(conn, userId, connectionToken);

    Log.Information("📈 Nova conexão SSE: UserId={UserId}, ConnectionId={ConnectionId}", userId, conn.ConnectionId);
    try {
      await Task.Delay(Timeout.Infinite, connectionToken);
    } catch (OperationCanceledException) {
      // cliente desconectou
    } finally {
      RemoveConnection(userId, conn.ConnectionId);
    }
  }

  /*****************************************************************************/
  /* Envia mensagem para um usuário específico                                 */
  /*****************************************************************************/
  public async Task SendToUserAsync(string userId, ESseEvents sseEvent, object message, CancellationToken ct = default) {
    if (!_connections.TryGetValue(userId, out var userConnections) || userConnections.Count == 0) return;

    Log.Debug("Enviando mensagem SSE para UserId={UserId} em {ConnectionCount} conexões: Event={Event}, Message={Message}",
              userId, userConnections.Count, sseEvent, message);

    var sseMessage = new SseMessage(sseEvent, message);
    var payload = FormatSseMessage(sseMessage);
    var invalidConnections = new List<string>();

    foreach (var connection in userConnections.Values) {
      try {
        await WriteRawAsync(connection, payload, ct);
      } catch {
        invalidConnections.Add(connection.ConnectionId);
      }
    }

    foreach (var connectionId in invalidConnections) {
      RemoveConnection(userId, connectionId);
    }
  }

  /*****************************************************************************/
  /* Envia mensagem para todos os usuários conectados                          */
  /*****************************************************************************/
  public async Task SendToAllAsync(ESseEvents sseEvent, object message, CancellationToken ct = default) {
    foreach (var userId in _connections.Keys) {
      await SendToUserAsync(userId, sseEvent, message, ct);
    }
  }

  /*****************************************************************************/
  /* Obtém o número de conexões ativas por usuário                             */
  /*****************************************************************************/
  public ActiveConnectionsDto GetActiveConnections() {
    var result = new Dictionary<string, int>();
    foreach (var entry in _connections) {
      result[entry.Key] = entry.Value.Count;
    }

    return new ActiveConnectionsDto {
      ActiveConnections = result,
      TotalUsers = result.Count
    };
  }

  /*****************************************************************************/
  /* Remove todas as conexões de um usuário                                    */
  /*****************************************************************************/
  public void DisconnectUser(string userId) {
    var haveConn = _connections.TryGetValue(userId, out var userConnections);
    if (haveConn)
      foreach (var connection in userConnections.Values)
        RemoveConnection(userId, connection.ConnectionId);
  }

  public ESseEvents TransformEventOrThrow(string eventName) {
    if (!Enum.IsDefined(typeof(ESseEvents), eventName)) {
      throw new ArgumentException("Evento inválido. Valores válidos: " + string.Join(", ", Enum.GetNames(typeof(ESseEvents))));
    }

    return Enum.Parse<ESseEvents>(eventName);
  }
  #endregion

  #region Métodos Privados
  /*****************************************************************************/
  /* Métodos privados                                                          */
  /*****************************************************************************/
  private void SetHeartbeatForConnection(SseConnection conn, string userId, CancellationToken ct) {
    _ = Task.Run(async () => {
      try {
        while (!ct.IsCancellationRequested) {
          await Task.Delay(TimeSpan.FromSeconds(30), ct);
          await WriteRawAsync(conn, ": heartbeat\n\n", ct);
        }
      } catch {
        RemoveConnection(userId, conn.ConnectionId);
      }
    }, ct);
  }

  private void RemoveConnection(string userId, string connectionId) {
    if (!_connections.TryGetValue(userId, out var userConnections)) return;
    if (!userConnections.TryRemove(connectionId, out var connection)) return;

    try {
      connection.HeartbeatCts?.Cancel();
      connection.HeartbeatCts?.Dispose();
      connection.Response.Body.Close();
      Log.Information("📉 Conexão SSE removida: UserId={UserId}, ConnectionId={ConnectionId}", userId, connectionId);
    } catch { }

    if (userConnections.IsEmpty) {
      _connections.TryRemove(userId, out _);
    }
  }

  private static string FormatSseMessage(SseMessage message) {
    var builder = new StringBuilder();

    var formatedEventName = message.Event.ToString().ToKebabCase();
    builder.Append("event: ").Append(formatedEventName).Append('\n');

    var jsonData = JsonSerializer.Serialize(message.Data);
    builder.Append("data: ").Append(jsonData).Append("\n\n");

    return builder.ToString();
  }

  private static string GenerateConnectionId() {
    return $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid():N}"[..24];
  }

  private static void PrepareHeaders(HttpContext context) {
    context.Response.Headers.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";
    context.Response.Headers["X-Accel-Buffering"] = "no";
  }

  private static async Task WriteRawAsync(SseConnection connection, string payload, CancellationToken ct) {
    await connection.WriteLock.WaitAsync(ct);
    try {
      await connection.Response.WriteAsync(payload, ct);
      await connection.Response.Body.FlushAsync(ct);
    } finally {
      connection.WriteLock.Release();
    }
  }
  #endregion
}
