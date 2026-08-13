using csharp_p2.src.Shared.Helpers;
using csharp_p2.src.Modules.Infra.Cache;
using csharp_p2.src.Config;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Modules.Session;

public interface ISessionCacheService {
  Task<UserSession> GetSessionAsync(string sessionToken);
  Task<SessionsPerUserRecordDto> GetActiveSessionsCountPerUserAsync();
  Task<string> CreateSessionAsync(UserSessionPayload payload, SessionOptionsDto options);
  Task<(bool, UserSession)> RefreshSessionAsync(string sessionToken);
  Task<int> UpdateSessionsByUserIdAsync(long userId, UserSessionPayload newPayload);
  Task DestroySessionAsync(string sessionToken);
  Task<int> DestroySessionsByUserIdAsync(long userId);
  Task DestroyAllSessionsAsync();
}

public class SessionCacheService : ISessionCacheService {
  private readonly ICacheClient _cache;
  private const string CACHE_KEY_PREFIX = "session:";
  private const string USER_SESSION_INDEX_PREFIX = "session-index:user:";
  private readonly EnvConfig _env;

  public SessionCacheService(ICacheClient cache, EnvConfig env) {
    _cache = cache;
    _env = env;
  }
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  #region Gets
  public async Task<UserSession> GetSessionAsync(string sessionToken) {
    var cacheKey = CACHE_KEY_PREFIX + sessionToken;
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

      var session = JsonSerializer.Deserialize<UserSession>(data);
      if (session == null) continue;

      if (sessions.ContainsKey(session.Payload.User.Email)) {
        sessions[session.Payload.User.Email]++;
      } else {
        sessions[session.Payload.User.Email] = 1;
      }
    }

    return new SessionsPerUserRecordDto { Sessions = sessions };
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  #region Create
  public async Task<string> CreateSessionAsync(UserSessionPayload payload, SessionOptionsDto options) {
    var sessionToken = TokenGenerator.GenerateToken();
    var now = DateTime.UtcNow;

    var session = new UserSession {
      Payload = payload,
      Options = options,
      CreatedAt = now,
      ExpiresAt = now.AddSeconds(_env.Cache.SessionTtlInSec)
    };

    var ttl = TimeSpan.FromSeconds(_env.Cache.SessionTtlInSec);
    var sessionData = JsonSerializer.Serialize(session);
    await _cache.SetAsync(GetSessionKey(sessionToken), sessionData, ttl);

    try {
      //dentro de try catch, para o caso de SetAsync funcionar, mas AddToSetAsync falhar, remover a sessão criada, para não deixar sessão sem índice
      await _cache.AddToSetAsync(GetUserSessionIndexKey(payload.User.Id), sessionToken, ttl);
    } catch {
      // Uma sessão sem índice não seria encontrada nas operações por usuário.
      await _cache.RemoveAsync(GetSessionKey(sessionToken));
      throw;
    }

    return sessionToken;
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  #region Update
  public async Task<(bool, UserSession)> RefreshSessionAsync(string sessionToken) {
    var sessionData = await GetSessionAsync(sessionToken);
    if (sessionData is null)
      throw new CustomError("Sessão inválida ou expirada.", StatusCodes.Status401Unauthorized);

    var now = DateTime.UtcNow;
    var oneDay = TimeSpan.FromDays(1);

    var timeToExpiry = sessionData.ExpiresAt - now;

    if (timeToExpiry > oneDay) //! regra explicada abaixo
      return (false, sessionData);

    sessionData.ExpiresAt = now.Add(oneDay);

    var newSessionData = JsonSerializer.Serialize(sessionData);
    await _cache.SetAsync(GetSessionKey(sessionToken), newSessionData, oneDay);

    // Recria ou renova o índice caso a sessão tenha sobrevivido por renovações.
    // O TTL completo evita que o índice expire antes de outra sessão do usuário.
    var setKey = GetUserSessionIndexKey(sessionData.Payload.User.Id);
    var ttlCompletoInSec = TimeSpan.FromSeconds(_env.Cache.SessionTtlInSec);
    await _cache.AddToSetAsync(setKey, sessionToken, ttlCompletoInSec);

    return (true, sessionData);
  }

  public async Task<int> UpdateSessionsByUserIdAsync(long userId, UserSessionPayload newPayload) {
    var sessionTokens = await GetUserSessionTokensAsync(userId);
    int updatedCount = 0;

    foreach (var sessionToken in sessionTokens) {
      var key = GetSessionKey(sessionToken);
      var data = await _cache.GetAsync<string>(key);
      if (data == null) {
        await RemoveTokenFromUserIndexAsync(userId, sessionToken);
        continue;
      }

      var sessionData = JsonSerializer.Deserialize<UserSession>(data);
      if (sessionData == null) {
        await RemoveTokenFromUserIndexAsync(userId, sessionToken);
        continue;
      }

      var ttl = sessionData.ExpiresAt - DateTime.UtcNow; //! mantem o tempo restante
      if (ttl <= TimeSpan.Zero) {
        await _cache.RemoveAsync(key);
        await RemoveTokenFromUserIndexAsync(userId, sessionToken);
        continue;
      }

      sessionData.Payload = newPayload;
      await _cache.SetAsync(key, JsonSerializer.Serialize(sessionData), ttl);
      updatedCount++;
    }

    return updatedCount;
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  #region Delete
  public async Task DestroySessionAsync(string sessionToken) {
    var session = await GetSessionAsync(sessionToken);
    await _cache.RemoveAsync(GetSessionKey(sessionToken));

    if (session is not null)
      await RemoveTokenFromUserIndexAsync(session.Payload.User.Id, sessionToken);
  }

  public async Task<int> DestroySessionsByUserIdAsync(long userId) {
    var sessionTokens = await GetUserSessionTokensAsync(userId);
    int removedCount = 0;

    foreach (var sessionToken in sessionTokens) {
      if (await _cache.RemoveAsync(GetSessionKey(sessionToken)))
        removedCount++;
    }

    //eliminados todos os tokens, remove o índice do usuário
    await _cache.RemoveAsync(GetUserSessionIndexKey(userId));
    return removedCount;
  }

  public async Task DestroyAllSessionsAsync() {
    var keys = await _cache.GetKeysByPrefixAsync(CACHE_KEY_PREFIX);
    foreach (var key in keys) {
      await _cache.RemoveAsync(key);
    }

    await _cache.RemoveByPrefixAsync(USER_SESSION_INDEX_PREFIX);
  }
  #endregion

  #region Private Helpers
  private Task<string[]> GetUserSessionTokensAsync(long userId) {
    return _cache.GetSetMembersAsync(GetUserSessionIndexKey(userId));
  }

  private Task<bool> RemoveTokenFromUserIndexAsync(long userId, string sessionToken) {
    return _cache.RemoveFromSetAsync(GetUserSessionIndexKey(userId), sessionToken);
  }

  private static string GetSessionKey(string sessionToken) {
    return CACHE_KEY_PREFIX + sessionToken;
  }

  private static string GetUserSessionIndexKey(long userId) {
    return USER_SESSION_INDEX_PREFIX + userId;
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

Índice de sessões por usuário:
Cada sessão continua armazenada em session:{token}, mas seu token também é
adicionado ao SET session-index:user:{userId}. Assim, atualizar ou destruir as
sessões de um usuário consulta somente os tokens dele, sem executar SCAN em todas
as sessões. O índice recebe o TTL completo da sessão e é renovado quando uma
sessão é renovada. Tokens cujo conteúdo já expirou são removidos do índice quando
encontrados. Operações realmente globais, como relatório administrativo e logout
de todos os usuários, continuam percorrendo todas as chaves session:*.
*/
