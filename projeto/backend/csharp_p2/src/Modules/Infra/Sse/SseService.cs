using System.Collections.Concurrent;
using csharp_p2.src.Config.builder.DI.Atributes;
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Modules.Infra.Sse;

public interface ISseService {
  Task ConnectAsync(string userId, HttpContext context, CancellationToken ct);
  Task SendToUserAsync(string userId, SseEvents sseEvent, object message, CancellationToken ct = default);
  Task SendToAllAsync(SseEvents sseEvent, object message, CancellationToken ct = default);
  ActiveConnectionsDto GetActiveConnections();
  Task DisconnectUserAsync(string userId);
  SseEvents TransformEventOrThrow(string eventName);
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
      UserId = userId,
      ConnectionId = GenerateConnectionId(),
      Response = context.Response
    };

    var userConnections = _connections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, SseConnection>());
    userConnections[conn.ConnectionId] = conn;

    conn.HeartbeatCts = CancellationTokenSource.CreateLinkedTokenSource(ct, context.RequestAborted);
    var connectionToken = conn.HeartbeatCts.Token;

    await WriteRawAsync(conn, ": SSE connection established\n\n", connectionToken);

    SetHeartbeatForConnection(conn, userId, connectionToken);

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
  public async Task SendToUserAsync(string userId, SseEvents sseEvent, object message, CancellationToken ct = default) {
    if (!_connections.TryGetValue(userId, out var userConnections) || userConnections.Count == 0) return;

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
  public async Task SendToAllAsync(SseEvents sseEvent, object message, CancellationToken ct = default) {
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
  public Task DisconnectUserAsync(string userId) {
    if (_connections.TryRemove(userId, out var userConnections)) {
      foreach (var connection in userConnections.Values) {
        try {
          connection.HeartbeatCts?.Cancel();
          connection.Response.Body.Close();
        } catch { }
      }
    }

    return Task.CompletedTask;
  }

  public SseEvents TransformEventOrThrow(string eventName) {
    if (!Enum.IsDefined(typeof(SseEvents), eventName)) {
      throw new ArgumentException("Evento inválido. Valores válidos: " + string.Join(", ", Enum.GetNames(typeof(SseEvents))));
    }

    return Enum.Parse<SseEvents>(eventName);
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
