using csharp_p2.src.Modules.Session.Model;
using csharp_p2.src.Shared.Helpers;
using csharp_p2.src.Modules.Infra.Cache;
using csharp_p2.src.Config;

namespace csharp_p2.src.Modules.Session;

public interface ISessionCacheService {
  Task<UserSession> GetSessionAsync(string sessionId);
  Task<SessionsPerUserRecordDto> GetActiveSessionsCountPerUserAsync();
  Task<string> CreateSessionAsync(UserSessionPayload payload);
  Task<bool> RefreshSessionAsync(string sessionToken);
  Task<int> UpdateSessionsByUserIdAsync(long userId, UserSessionPayload newPayload);
  Task DestroySessionAsync(string sessionToken);
  Task<int> DestroySessionsByUserIdAsync(long userId);
  Task DestroyAllSessionsAsync();
}

public class SessionCacheService : ISessionCacheService {
  private readonly ICacheClient _cache;
  private const string CACHE_KEY_PREFIX = "session:";
  private readonly EnvConfig _env;

  public SessionCacheService(ICacheClient cache, EnvConfig env) {
    _cache = cache;
    _env = env;
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  #region Gets
  public async Task<UserSession> GetSessionAsync(string sessionId) {
    var cacheKey = CACHE_KEY_PREFIX + sessionId;
    var sessionData = await _cache.GetAsync<string>(cacheKey);
    if (sessionData == null) {
      return null;
    }
    return JsonSerializer.Deserialize<UserSession>(sessionData);
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
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  #region Create
  public async Task<string> CreateSessionAsync(UserSessionPayload payload) {
    var sessionToken = TokenGenerator.GenerateToken();
    var now = DateTime.UtcNow;

    var session = new UserSession {
      Payload = payload,
      CreatedAt = now,
      ExpiresAt = now.AddSeconds(_env.Cache.SessionTtlInSec)
    };

    var sessionData = JsonSerializer.Serialize(session);
    await _cache.SetAsync($"{CACHE_KEY_PREFIX}{sessionToken}", sessionData, TimeSpan.FromSeconds(_env.Cache.SessionTtlInSec));

    return sessionToken;
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  #region Update
  public async Task<bool> RefreshSessionAsync(string sessionToken) {
    var sessionData = await GetSessionAsync(sessionToken);
    if (sessionData is null)
      throw new UnauthorizedAccessException("Sessão inválida ou expirada");

    var now = DateTime.UtcNow;
    var oneDay = TimeSpan.FromDays(1);

    var timeToExpiry = sessionData.ExpiresAt - now;

    if (timeToExpiry > oneDay) //! regra explicada abaixo
      return false;

    sessionData.ExpiresAt = now.Add(oneDay);

    var newSessionData = JsonSerializer.Serialize(sessionData);
    await _cache.SetAsync($"{CACHE_KEY_PREFIX}{sessionToken}", newSessionData, oneDay);

    return true;
  }

  public async Task<int> UpdateSessionsByUserIdAsync(long userId, UserSessionPayload newPayload) {
    var keys = await _cache.GetKeysByPrefixAsync(CACHE_KEY_PREFIX);
    int updatedCount = 0;

    foreach (var key in keys) {
      var data = await _cache.GetAsync<string>(key);
      if (data == null) continue;

      var sessionData = JsonSerializer.Deserialize<UserSession>(data);
      if (sessionData == null) continue;

      if (sessionData.Payload.User.Id == userId) {
        sessionData.Payload = newPayload;
        var ttl = sessionData.ExpiresAt - DateTime.UtcNow; //! mantem o tempo restante
        await _cache.SetAsync(key, JsonSerializer.Serialize(sessionData), ttl);
        updatedCount++;
      }
    }

    return updatedCount;
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  #region Delete
  public async Task DestroySessionAsync(string sessionToken) {
    await _cache.RemoveAsync($"{CACHE_KEY_PREFIX}{sessionToken}");
  }

  public async Task<int> DestroySessionsByUserIdAsync(long userId) {
    var keys = await _cache.GetKeysByPrefixAsync(CACHE_KEY_PREFIX);
    int removedCount = 0;

    foreach (var key in keys) {
      var data = await _cache.GetAsync<string>(key);
      if (data == null) continue;

      var sessionData = JsonSerializer.Deserialize<UserSession>(data);
      if (sessionData == null) continue;

      if (sessionData.Payload.User.Id == userId) {
        await _cache.RemoveAsync(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  public async Task DestroyAllSessionsAsync() {
    var keys = await _cache.GetKeysByPrefixAsync(CACHE_KEY_PREFIX);
    foreach (var key in keys) {
      await _cache.RemoveAsync(key);
    }
  }
  #endregion
}

/*
regra:
Por padrão as sessões expiram em 7 dias (604800 segundos).
Ao acessar uma sessão, se ela tiver menos de 1 dia (86400 segundos) para expirar,
ela é renovada para expirar em mais 1 dia a partir do momento do acesso.
Isso garante que sessões ativas permaneçam válidas, enquanto sessões inativas
expiram naturalmente após 7 dias.
*/
