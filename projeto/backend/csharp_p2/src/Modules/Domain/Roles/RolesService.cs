using csharp_p2.src.Modules.Entities;

namespace csharp_p2.src.Modules.Domain.Roles;

public interface IRolesService {
  Task<Role> CreateRoleAsync(Role role);
  Task<Role> GetRoleByIdAsync(long id);
  Task<IEnumerable<Role>> GetAllRolesAsync();
  Task<Role> UpdateRoleAsync(Role role);
  Task<bool> DeleteRoleAsync(long id);
}

public class RolesService : IRolesService {
  private readonly IGenericEntityRepository<Role> _roleRepository;

  public RolesService(IGenericEntityRepository<Role> roleRepository) {
    _roleRepository = roleRepository;
  }

  public async Task<Role> CreateRoleAsync(Role role) {
    await using var trx = await _roleRepository.GetContext().Database.BeginTransactionAsync();
    try {
      var createdRole = await _roleRepository.InsertAsync(role);
      await trx.CommitAsync();
      return createdRole;
    } catch {
      await trx.RollbackAsync();
      throw;
    }
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

  public async Task<IEnumerable<Role>> GetAllRolesAsync() {
    var roles = await _roleRepository.GetAllAsync();
    return roles;

  }

  public Task<Role> GetRoleByIdAsync(long id) {
    return _roleRepository.GetByIdAsync(id);
  }

  public Task<Role> UpdateRoleAsync(Role role) {
    return _roleRepository.UpdateAsync(role)
              .ContinueWith(t => {
                if (t.Result) return role;
                throw new Exception("Erro ao atualizar Role");
              });
  }
}
