using Microsoft.Extensions.Caching.Memory;

namespace csharp_p2.src.Modules.Infra.Cache;

public sealed class MemoryCacheClient : ICacheClient {
  private readonly IMemoryCache _cache;
  private readonly HashSet<string> _keys = new();
  private readonly object _lock = new();

  public MemoryCacheClient(IMemoryCache cache) {
    _cache = cache;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public Task<T> GetAsync<T>(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    if (!_cache.TryGetValue(key, out string json) || string.IsNullOrWhiteSpace(json))
      return Task.FromResult(default(T)!);

    var value = JsonSerializer.Deserialize<T>(json);
    return Task.FromResult(value!);
  }

  public Task<T[]> GetByPrefixAsync<T>(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    List<string> keysSnapshot;
    lock (_lock) {
      keysSnapshot = _keys.Where(k => k.StartsWith(key, StringComparison.Ordinal)).ToList();
    }

    var result = new List<T>();
    foreach (var k in keysSnapshot) {
      ct.ThrowIfCancellationRequested();
      if (!_cache.TryGetValue(k, out string json) || string.IsNullOrWhiteSpace(json)) continue;

      var item = JsonSerializer.Deserialize<T>(json);
      if (item is not null) result.Add(item);
    }

    return Task.FromResult(result.ToArray());
  }

  public Task<string[]> GetKeysByPrefixAsync(string prefix, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    List<string> keysSnapshot;
    lock (_lock) {
      keysSnapshot = _keys.Where(k => k.StartsWith(prefix, StringComparison.Ordinal)).ToList();
    }

    return Task.FromResult(keysSnapshot.ToArray());
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE/UPDATE
  public Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    var json = JsonSerializer.Serialize(value);
    var options = new MemoryCacheEntryOptions();
    if (ttl.HasValue) options.AbsoluteExpirationRelativeToNow = ttl;

    _cache.Set(key, json, options);

    lock (_lock) {
      _keys.Add(key);
    }

    return Task.CompletedTask;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!REMOVE
  public Task<bool> RemoveAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    _cache.Remove(key);
    lock (_lock) {
      _keys.Remove(key);
    }

    return Task.FromResult(true);
  }

  public Task<bool> RemoveByPrefixAsync(string key, CancellationToken ct = default) {
    ct.ThrowIfCancellationRequested();

    List<string> keysToRemove;
    lock (_lock) {
      keysToRemove = _keys.Where(k => k.StartsWith(key, StringComparison.Ordinal)).ToList();
    }

    foreach (var k in keysToRemove) {
      _cache.Remove(k);
    }

    lock (_lock) {
      foreach (var k in keysToRemove) _keys.Remove(k);
    }

    return Task.FromResult(keysToRemove.Count > 0);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CLEAR
  public Task<bool> Clear() {
    List<string> keysSnapshot;
    lock (_lock) {
      keysSnapshot = _keys.ToList();
    }

    foreach (var key in keysSnapshot) {
      _cache.Remove(key);
    }

    lock (_lock) {
      _keys.Clear();
    }

    return Task.FromResult(true);
  }
}
