using csharp_p2.src.Modules.Infra.Cache;
using StackExchange.Redis;

namespace Microsoft.Extensions.Caching;

public sealed class RedisCacheClient : ICacheClient {
  private readonly IConnectionMultiplexer _mux;
  private readonly IDatabase _db;

  public RedisCacheClient(IConnectionMultiplexer mux) {
    _mux = mux;
    _db = mux.GetDatabase();
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  #region Gets
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

  public async Task<string[]> GetSetMembersAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var members = await _db.SetMembersAsync(key);
    return members.Select(member => member.ToString()).ToArray();
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE/UPDATE
  #region Create/Update
  public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var json = JsonSerializer.Serialize(value);
    await _db.StringSetAsync(key, json, ttl);
  }

  public async Task AddToSetAsync(string key, string value, TimeSpan? ttl = null, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    await _db.SetAddAsync(key, value);
    if (ttl.HasValue)
      await _db.KeyExpireAsync(key, ttl); // Define/Atualiza o TTL do conjunto, se fornecido.
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!REMOVE
  #region Remove
  public Task<bool> RemoveAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();
    return _db.KeyDeleteAsync(key);
  }

  public Task<bool> RemoveFromSetAsync(string key, string value, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();
    return _db.SetRemoveAsync(key, value);
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
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CLEAR
  #region Clear
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
  #endregion
}
