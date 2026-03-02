using csharp_p2.src.Modules.Session.Model;
using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Modules.Domain.Roles;

namespace csharp_p2.src.Modules.Session;

public interface ISessionService {
  Task<CreateUserSessionResponse> CreateSession(User user);
  Task<UserSessionPayload> MontarPayloadAsync(User user);
}

public class SessionService : ISessionService {
  private readonly IServiceProvider _serviceProvider;
  private readonly ISessionCacheService _sessionCacheService;

  public SessionService(IServiceProvider serviceProvider, ISessionCacheService sessionCacheService) {
    _serviceProvider = serviceProvider;
    _sessionCacheService = sessionCacheService;
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

    return new UserSessionPayload {
      User = {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email.ToString(),
        Role = dadosAdicionaisUsuario.Role
      }
    };
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
