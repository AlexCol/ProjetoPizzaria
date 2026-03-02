using Microsoft.Extensions.Caching.Distributed;
using csharp_p2.src.Modules.Session.Model;
using csharp_p2.src.Shared.Helpers;
using csharp_p2.src.Infra.Cache;

namespace csharp_p2.src.Modules.Session;

public class SessionCacheService {
  private readonly ICacheClient _cache;
  private const string CACHE_KEY_PREFIX = "user_session_";

  public SessionCacheService(ICacheClient cache) {
    _cache = cache;
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<UserSessionPayload> GetSessionAsync(string sessionId) {
    var cacheKey = CACHE_KEY_PREFIX + sessionId;
    var sessionData = await _cache.GetAsync<string>(cacheKey);
    if (sessionData == null) {
      return null;
    }
    return JsonSerializer.Deserialize<UserSessionPayload>(sessionData);
  }

  public async Task<SessionsPerUserRecordDto> GetActiveSessionsCountPerUserAsync() {
    var sessions = new Dictionary<string, int>();
    var keys = await _cache.GetKeysByPrefixAsync(CACHE_KEY_PREFIX);

    foreach (var key in keys) {
      var data = await _cache.GetAsync<string>(key);
      if (data == null) continue;

      var payload = JsonSerializer.Deserialize<UserSessionPayload>(data);
      if (payload == null) continue;

      if (sessions.ContainsKey(payload.User.Email)) {
        sessions[payload.User.Email]++;
      } else {
        sessions[payload.User.Email] = 1;
      }
    }

    return new SessionsPerUserRecordDto { Sessions = sessions };
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<string> CreateSessionAsync(UserSessionPayload payload, TimeSpan expiration) {
    var sessionId = TokenGenerator.GenerateToken();
    var cacheKey = CACHE_KEY_PREFIX + sessionId;
    var sessionData = JsonSerializer.Serialize(payload);
    // await _cache.SetAsync(cacheKey, sessionData, new DistributedCacheEntryOptions {
    //   AbsoluteExpirationRelativeToNow = expiration
    // });
    return sessionId;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
}
