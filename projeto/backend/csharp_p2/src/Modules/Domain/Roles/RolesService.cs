using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Shared.DTOs.Roles;

namespace csharp_p2.src.Modules.Domain.Roles;

public interface IRolesService {
  Task<Role> CreateRoleAsync(RoleDto dto);
  Task<Role> GetRoleByIdAsync(long id);
  Task<IEnumerable<Role>> GetAllRolesAsync();
  Task<Role> UpdateRoleAsync(long id, RoleDto dto);
  Task<bool> DeleteRoleAsync(long id);
}

public class RolesService : IRolesService {
  private readonly IGenericEntityRepository<Role> _roleRepository;

  public RolesService(IGenericEntityRepository<Role> roleRepository) {
    _roleRepository = roleRepository;
  }

  public async Task<IEnumerable<Role>> GetAllRolesAsync() {
    var roles = await _roleRepository.GetAllAsync();
    return roles;

  }

  public Task<Role> GetRoleByIdAsync(long id) {
    return _roleRepository.GetByIdAsync(id);
  }

  public async Task<Role> CreateRoleAsync(RoleDto dto) {
    await using var trx = await _roleRepository.GetContext().Database.BeginTransactionAsync();
    try {
      var role = new Role {
        Description = dto.Description
      };
      var createdRole = await _roleRepository.InsertAsync(role);
      await trx.CommitAsync();
      return createdRole;
    } catch {
      await trx.RollbackAsync();
      throw;
    }
  }

  public async Task<Role> UpdateRoleAsync(long id, RoleDto dto) {
    var role = await _roleRepository.GetByIdAsync(id);
    if (role == null) throw new Exception("Role not found");

    role.Description = dto.Description;

    return await _roleRepository.UpdateAsync(role)
              .ContinueWith(t => {
                if (t.Result) return role;
                throw new Exception("Erro ao atualizar Role");
              });
  }

  public async Task<bool> DeleteRoleAsync(long id) {
    await using var trx = await _roleRepository.GetContext().Database.BeginTransactionAsync();
    try {
      var deleted = await _roleRepository.DeleteAsync(id);
      await trx.CommitAsync();
      return deleted;
    } catch {
      await trx.RollbackAsync();
      throw;
    }
  }
}
