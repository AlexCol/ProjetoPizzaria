using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Pagination;

namespace csharp_p2.src.Modules.Domain;

public interface IRolesService {
  Task<Role> CreateRoleAsync(RoleDto dto);
  Task<Role> GetRoleByIdAsync(long id);
  Task<IEnumerable<Role>> GetAllRolesAsync();
  Task<PaginatedResult<Role>> GetRolesWithSearchCriteriaAsync(SearchCriteriaRequest<Role> searchCriteria);
  Task<Role> UpdateRoleAsync(long id, RoleDto dto);
  Task<bool> DeleteRoleAsync(long id);
}

public class RolesService : IRolesService {
  private readonly IGenericEntityRepository<Role> _roleRepository;
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly ISessionService _sessionService;

  public RolesService(IGenericEntityRepository<Role> roleRepository, IGenericEntityRepository<User> userRepository, ISessionService sessionService) {
    _roleRepository = roleRepository;
    _userRepository = userRepository;
    _sessionService = sessionService;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<IEnumerable<Role>> GetAllRolesAsync() {
    var roles = await _roleRepository.GetAllAsync();
    return roles;
  }

  public async Task<Role> GetRoleByIdAsync(long id) {
    return await _roleRepository.GetByIdAsync(id);
  }

  public async Task<PaginatedResult<Role>> GetRolesWithSearchCriteriaAsync(SearchCriteriaRequest<Role> searchCriteria) {
    var resultado = await _roleRepository.GetWithSearchCriteriaAsync(searchCriteria);
    return resultado;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<Role> CreateRoleAsync(RoleDto dto) {
    await using var trx = await _roleRepository.BeginTransactionAsync();
    try {
      var existingRole = await _roleRepository.FindOneWithPredicateAsync((r) =>
        r.Name.ToLower() == dto.Name.ToLower()
      );
      if (existingRole != null) throw new CustomError("Role already exists");

      var role = new Role {
        Name = dto.Name
      };
      var createdRole = await _roleRepository.InsertAsync(role);
      await trx.CommitAsync();
      return createdRole;
    } catch {
      await trx.RollbackAsync();
      throw;
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  public async Task<Role> UpdateRoleAsync(long id, RoleDto dto) {
    var role = await _roleRepository.GetByIdAsync(id);
    if (role == null) throw new CustomError("Role not found", 404);

    if (role.Name == dto.Name)
      throw new CustomError("No changes detected.");

    role.Name = dto.Name;

    var updates = await _roleRepository.UpdateAsync(role)
              .ContinueWith(t => {
                if (t.Result) return role;
                throw new Exception("Erro ao atualizar Role: " + t.Exception?.Message);
              });

    await SendRoleUpdateNotificationAsync(role);

    return updates;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task<bool> DeleteRoleAsync(long id) {
    await using var trx = await _roleRepository.BeginTransactionAsync();
    try {
      var usersWithRole = await _userRepository.FindOneWithPredicateAsync(u => u.RoleId == id);
      if (usersWithRole != null) {
        throw new CustomError("Cannot delete role with associated users.");
      }

      var deleted = await _roleRepository.DeleteAsync(id);
      await trx.CommitAsync();
      return deleted;
    } catch {
      await trx.RollbackAsync();
      throw;
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Private Methods
  private async Task SendRoleUpdateNotificationAsync(Role role) {
    var usersIds = await _userRepository.SearchWithPredicateAsync(u => u.RoleId == role.Id);
    foreach (var user in usersIds) {
      await _sessionService.SendSessionUpdateNotificationAsync(user.Id);
    }
  }
}
