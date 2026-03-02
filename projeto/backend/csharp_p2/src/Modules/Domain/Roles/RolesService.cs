using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Shared.DTOs.Roles;
using Shared.Exceptions;

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
  private readonly IGenericEntityRepository<User> _userRepository;

  public RolesService(IGenericEntityRepository<Role> roleRepository, IGenericEntityRepository<User> userRepository) {
    _roleRepository = roleRepository;
    _userRepository = userRepository;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<IEnumerable<Role>> GetAllRolesAsync() {
    var roles = await _roleRepository.GetAllAsync();
    return roles;

  }

  public Task<Role> GetRoleByIdAsync(long id) {
    return _roleRepository.GetByIdAsync(id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<Role> CreateRoleAsync(RoleDto dto) {
    await using var trx = await _roleRepository.GetContext().Database.BeginTransactionAsync();
    try {
      var existingRole = await _roleRepository.FindOneWithPredicateAsync((r) =>
        r.Description.Equals(dto.Description, StringComparison.OrdinalIgnoreCase)
      );
      if (existingRole != null) throw new CustomError("Role already exists");

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

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  public async Task<Role> UpdateRoleAsync(long id, RoleDto dto) {
    var role = await _roleRepository.GetByIdAsync(id);
    if (role == null) throw new CustomError("Role not found");

    role.Description = dto.Description;

    return await _roleRepository.UpdateAsync(role)
              .ContinueWith(t => {
                if (t.Result) return role;
                throw new Exception("Erro ao atualizar Role: " + t.Exception?.Message);
              });
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public async Task<bool> DeleteRoleAsync(long id) {
    await using var trx = await _roleRepository.GetContext().Database.BeginTransactionAsync();
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
}
