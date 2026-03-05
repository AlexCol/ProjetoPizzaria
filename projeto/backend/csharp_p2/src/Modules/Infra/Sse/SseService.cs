using System.Collections.Concurrent;
using csharp_p2.src.Config.builder.DI.Atributes;
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Modules.Infra.Sse;

public interface ISseService {
  Task ConnectAsync(string userId, HttpContext context, CancellationToken ct);
  Task SendToUserAsync(string userId, SseMessage message, CancellationToken ct = default);
  Task SendToAllAsync(SseMessage message, CancellationToken ct = default);
  ActiveConnectionsDto GetActiveConnections();
  Task DisconnectUserAsync(string userId);
}

[Injectable(EServiceLifetimeType.Singleton)]
public class SseService : ISseService {
  private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, SseConnection>> _connections = new();

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

    _ = Task.Run(async () => {
      try {
        while (!connectionToken.IsCancellationRequested) {
          await Task.Delay(TimeSpan.FromSeconds(30), connectionToken);
          await WriteRawAsync(conn, ": heartbeat\n\n", connectionToken);
        }
      } catch {
        RemoveConnection(userId, conn.ConnectionId);
      }
    }, connectionToken);

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
  public async Task SendToUserAsync(string userId, SseMessage message, CancellationToken ct = default) {
    if (!_connections.TryGetValue(userId, out var userConnections) || userConnections.Count == 0) return;

    var payload = FormatSseMessage(message);
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
  public async Task SendToAllAsync(SseMessage message, CancellationToken ct = default) {
    foreach (var userId in _connections.Keys) {
      await SendToUserAsync(userId, message, ct);
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

  /*****************************************************************************/
  /* Remove uma Conexão Específica                                             */
  /*****************************************************************************/
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

  /*****************************************************************************/
  /* Métodos privados                                                          */
  /*****************************************************************************/
  private static string FormatSseMessage(SseMessage message) {
    var builder = new StringBuilder();

    if (!string.IsNullOrWhiteSpace(message.Event)) {
      builder.Append("event: ").Append(message.Event).Append('\n');
    }

    builder.Append("data: ").Append(JsonSerializer.Serialize(message.Data)).Append("\n\n");
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
}
