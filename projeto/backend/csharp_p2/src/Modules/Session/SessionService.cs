using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Infra.Sse;
using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Modules.Session;

public interface ISessionService {
  Task<CreateUserSessionResponse> CreateSession(User user);
  Task<UserSessionPayload> MontarPayloadAsync(User user);
  Task SendSessionUpdateNotificationAsync(long userId);
}

public class SessionService : ISessionService {
  private readonly IServiceProvider _serviceProvider;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly IServiceScopeFactory _scopeFactory;

  public SessionService(IServiceProvider serviceProvider, ISessionCacheService sessionCacheService, IServiceScopeFactory scopeFactory) {
    _serviceProvider = serviceProvider;
    _sessionCacheService = sessionCacheService;
    _scopeFactory = scopeFactory;
  }

  /*****************************************************************************/
  /* Metodos Interface                                                          */
  /*****************************************************************************/
  #region Metodos Interface
  public async Task<CreateUserSessionResponse> CreateSession(User user) {
    var payload = await MontarPayloadAsync(user);
    var sessionToken = await _sessionCacheService.CreateSessionAsync(payload);

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

  public async Task SendSessionUpdateNotificationAsync(long userId) {
    _ = Task.Run(async () => {
      using var scope = _scopeFactory.CreateScope();
      try {
        var sseService = scope.ServiceProvider.GetRequiredService<ISseService>();
        await sseService.SendToUserAsync(userId.ToString(), SseEvents.SessionUpdated, null);
      } catch (Exception ex) {
        Log.Error("Error sending session update notification: " + ex.Message);
      }
    });
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
