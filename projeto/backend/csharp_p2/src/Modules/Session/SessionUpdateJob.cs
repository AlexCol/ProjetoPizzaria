using csharp_p2.src.Config.Builder;
using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Sse;

namespace csharp_p2.src.Modules.Session;

[Injectable(typeof(ISessionUpdateJob), EServiceLifetimeType.Scoped)]
public class SessionUpdateJob : ISessionUpdateJob {
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly ISessionService _sessionService;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly ISseService _sseService;

  public SessionUpdateJob(
    IGenericEntityRepository<User> userRepository,
    ISessionService sessionService,
    ISessionCacheService sessionCacheService,
    ISseService sseService
  ) {
    _userRepository = userRepository;
    _sessionService = sessionService;
    _sessionCacheService = sessionCacheService;
    _sseService = sseService;
  }

  public async Task ExecuteAsync(long userId) {
    var user = await _userRepository.GetByIdWithReferencesAsync(userId);
    if (user is null) return;

    var payload = await _sessionService.MontarPayloadAsync(user);
    await _sessionCacheService.UpdateSessionsByUserIdAsync(userId, payload);
    await _sseService.SendToUserAsync(userId.ToString(), ESseEvents.SessionUpdated, null);
  }
}
