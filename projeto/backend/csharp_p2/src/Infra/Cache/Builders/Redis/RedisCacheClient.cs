using csharp_p2.src.Infra.Cache;
using StackExchange.Redis;

namespace Microsoft.Extensions.Caching.Redis;

public sealed class RedisCacheClient : ICacheClient {
  private readonly IConnectionMultiplexer _mux;
  private readonly IDatabase _db;

  public RedisCacheClient(IConnectionMultiplexer mux) {
    _mux = mux;
    _db = mux.GetDatabase();
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<T> GetAsync<T>(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var value = await _db.StringGetAsync(key);
    if (value.IsNullOrEmpty) return default;

    var json = value.ToString();
    return JsonSerializer.Deserialize<T>(json);
  }

  public async Task<T[]> GetByPrefixAsync<T>(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var values = new List<T>();
    foreach (var endpoint in _mux.GetEndPoints()) {
      var server = _mux.GetServer(endpoint);
      if (!server.IsConnected) continue;

      await foreach (var redisKey in server.KeysAsync(pattern: $"{key}*")) {
        ct.ThrowIfCancellationRequested();
        var value = await _db.StringGetAsync(redisKey);
        if (value.IsNullOrEmpty) continue;

        var json = value.ToString();
        var item = JsonSerializer.Deserialize<T>(json);
        if (item is not null) values.Add(item);
      }
    }

    return values.ToArray();
  }

  public async Task<string[]> GetKeysByPrefixAsync(string prefix, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var keys = new List<string>();
    foreach (var endpoint in _mux.GetEndPoints()) {
      var server = _mux.GetServer(endpoint);
      if (!server.IsConnected) continue;

      await foreach (var redisKey in server.KeysAsync(pattern: $"{prefix}*")) {
        ct.ThrowIfCancellationRequested();
        keys.Add(redisKey.ToString());
      }
    }

    return [.. keys];
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE/UPDATE
  public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var json = JsonSerializer.Serialize(value);
    await _db.StringSetAsync(key, json, ttl);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!REMOVE
  public Task<bool> RemoveAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();
    return _db.KeyDeleteAsync(key);
  }

  public async Task<bool> RemoveByPrefixAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var deleted = false;
    foreach (var endpoint in _mux.GetEndPoints()) {
      var server = _mux.GetServer(endpoint);
      if (!server.IsConnected) continue;

      await foreach (var redisKey in server.KeysAsync(pattern: $"{key}*")) {
        ct.ThrowIfCancellationRequested();
        deleted |= await _db.KeyDeleteAsync(redisKey);
      }
    }

    return deleted;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CLEAR
  public async Task<bool> Clear() {
    var deleted = false;
    foreach (var endpoint in _mux.GetEndPoints()) {
      var server = _mux.GetServer(endpoint);
      if (!server.IsConnected) continue;

      await foreach (var redisKey in server.KeysAsync(pattern: "*")) {
        deleted |= await _db.KeyDeleteAsync(redisKey);
      }
    }

    return deleted;
  }
}
