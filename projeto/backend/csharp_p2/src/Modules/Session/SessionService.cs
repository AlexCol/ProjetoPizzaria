using Microsoft.Extensions.Caching.Distributed;
using csharp_p2.src.Modules.Session.Model;
using csharp_p2.src.Shared.Helpers;
using csharp_p2.src.Infra.Cache;
using csharp_p2.src.Config;
using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Modules.Domain.Roles;
using csharp_p2.src.Shared.VOs;

namespace csharp_p2.src.Modules.Session;

public class SessionService {
  private readonly IServiceProvider _serviceProvider;

  public SessionService(IServiceProvider serviceProvider) {
    _serviceProvider = serviceProvider;
  }

  /*****************************************************************************/
  /* Metodos Interface                                                          */
  /*****************************************************************************/
  #region Metodos Interface
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
