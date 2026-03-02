namespace csharp_p2.src.Infra.Cache;

public interface ICacheClient {
  Task<T> GetAsync<T>(string key, CancellationToken ct = default);
  Task<T[]> GetByPrefixAsync<T>(string key, CancellationToken ct = default);
  Task<string[]> GetKeysByPrefixAsync(string prefix, CancellationToken ct = default);

  Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default);

  Task<bool> RemoveAsync(string key, CancellationToken ct = default);
  Task<bool> RemoveByPrefixAsync(string key, CancellationToken ct = default);

  Task<bool> Clear();
}
