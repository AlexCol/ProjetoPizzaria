using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Shared.DTOs;
using Hangfire;

namespace csharp_p2.src.Modules.Session;

public interface ISessionService {
  Task<CreateUserSessionResponse> CreateSession(User user, SessionOptionsDto options);
  Task<UserSessionPayload> MontarPayloadAsync(User user);
  Task UpdateSessionAsync(long userId);
}

public class SessionService : ISessionService {
  private readonly IBackgroundJobClient _backgroundJobClient;
  private readonly IServiceProvider _serviceProvider;
  private readonly ISessionCacheService _sessionCacheService;

  public SessionService(IServiceProvider serviceProvider, ISessionCacheService sessionCacheService, IBackgroundJobClient backgroundJobClient) {
    _serviceProvider = serviceProvider;
    _sessionCacheService = sessionCacheService;
    _backgroundJobClient = backgroundJobClient;
  }

  /*****************************************************************************/
  /* Metodos Interface                                                          */
  /*****************************************************************************/
  #region Metodos Interface
  public async Task<CreateUserSessionResponse> CreateSession(User user, SessionOptionsDto options) {
    var payload = await MontarPayloadAsync(user);
    var sessionToken = await _sessionCacheService.CreateSessionAsync(payload, options);

    return new CreateUserSessionResponse {
      SessionToken = sessionToken,
      UserSessionPayload = payload
    };
  }

  public async Task<UserSessionPayload> MontarPayloadAsync(User user) {
    var dadosAdicionaisUsuario = await BucarDadosAdicionaisUsuarioAsync(user);

    user.Role = dadosAdicionaisUsuario.Role;

    var payload = new UserSessionPayload {
      User = new ResponseUserDto(user)
    };

    return payload;
  }

  public Task UpdateSessionAsync(long userId) {
    _backgroundJobClient.Enqueue<ISessionUpdateJob>(job => job.ExecuteAsync(userId));
    return Task.CompletedTask;
  }

  #endregion

  /*****************************************************************************/
  /* Metodos Privados                                                          */
  /*****************************************************************************/
  #region Metodos Privados
  private record DadosAdicionaisUsuario {
    public Role Role { get; init; }
  }
  private async Task<DadosAdicionaisUsuario> BucarDadosAdicionaisUsuarioAsync(User user) {
    var roleService = _serviceProvider.GetService<IRolesService>();
    var role = await roleService.GetRoleByIdAsync(user.RoleId);

    return new DadosAdicionaisUsuario { Role = role };
  }
  #endregion
}
