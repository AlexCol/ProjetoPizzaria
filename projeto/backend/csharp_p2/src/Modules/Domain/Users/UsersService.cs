using csharp_p2.src.Modules.Infra.Email;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.VOs;

namespace csharp_p2.src.Modules.Domain;

public interface IUsersService {
  Task<ResponseUserDto> GetUserByIdAsync(long id);
  Task<User> GetEntityByEmailWithPasswordAsync(EmailVO email);
  Task<IEnumerable<ResponseUserDto>> GetAllUsersAsync();
  Task<ResponseUserDto> CreateUserAsync(CreateUserDto dto);
  Task<ResponseUserDto> UpdateUserAsync(long id, UpdateUserDto dto);
}

public class UsersService : IUsersService {
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly IRolesService _roleService;
  private readonly IServiceScopeFactory _scopeFactory;

  public UsersService(IGenericEntityRepository<User> userRepository, IRolesService roleService, IServiceScopeFactory scopeFactory) {
    _userRepository = userRepository;
    _roleService = roleService;
    _scopeFactory = scopeFactory;
  }

  #region GETS
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!GETS
  public async Task<IEnumerable<ResponseUserDto>> GetAllUsersAsync() {
    var users = await _userRepository.GetAllAsync();
    return users.Select(user => new ResponseUserDto(user));
  }

  public async Task<ResponseUserDto> GetUserByIdAsync(long id) {
    var user = await _userRepository.GetByIdWithReferencesAsync(id);
    if (user == null) {
      throw new CustomError("User not found.");
    }
    return new ResponseUserDto(user);
  }

  public Task<User> GetEntityByEmailWithPasswordAsync(EmailVO email) {
    return _userRepository.FindOneWithPredicateAsync(u => u.Email.Equals(email));
  }
  #endregion

  #region CREATE
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!CREATE
  public async Task<ResponseUserDto> CreateUserAsync(CreateUserDto dto) {
    var dtoEmailVO = new EmailVO(dto.Email);
    var users = await _userRepository.GetAllAsync();
    var existingUser = users.FirstOrDefault(u => u.Email.Equals(dtoEmailVO));
    if (existingUser != null) {
      throw new CustomError("Email already in use.");
    }

    if (dto.Password != dto.ConfirmPassword) {
      throw new CustomError("Password and Confirm Password do not match.");
    }

    var role = await _roleService.GetRoleByIdAsync(dto.RoleId.Value);
    if (role == null) {
      throw new CustomError("Role not found.");
    }

    var newUser = new User {
      Email = dtoEmailVO,
      Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
      Name = dto.Name,
      RoleId = dto.RoleId.Value,
      Status = (int)EUserStatus.Inactive //? usuário criado como inativo, precisa ativar por email
    };

    var createdUser = await _userRepository.InsertAsync(newUser);
    var userWithRole = await _userRepository.GetByIdWithReferencesAsync(createdUser.Id); //? para retornar o role junto no dto

    await SendEmailForActivationAsync(newUser);

    return new ResponseUserDto(userWithRole);
  }
  #endregion

  #region UPDATE
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATE
  public async Task<ResponseUserDto> UpdateUserAsync(long id, UpdateUserDto dto) {
    if (dto.Password != null && dto.Password != dto.ConfirmPassword) {
      throw new CustomError("Password and Confirm Password do not match.");
    }

    var userToUpdate = await _userRepository.GetByIdAsync(id);
    if (userToUpdate == null) {
      throw new CustomError("User not found.");
    }

    if (dto.Password != null) {
      userToUpdate.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
    }

    if (dto.Name != null) {
      userToUpdate.Name = dto.Name;
    }

    if (dto.RoleId != 0) {
      userToUpdate.RoleId = dto.RoleId;
    }

    var updatedUser = await _userRepository
            .UpdateAsync(userToUpdate)
            .ContinueWith(task => task.Result ? userToUpdate : throw new Exception("Failed to update user: " + task.Exception?.Message));

    var userWithRole = await _userRepository.GetByIdWithReferencesAsync(updatedUser.Id); //? para retornar o role junto no dto
    return new ResponseUserDto(userWithRole);
  }
  #endregion

  #region SendEmail
  private async Task SendEmailForActivationAsync(User newUser) {
    _ = Task.Run(async () => {
      using var scope = _scopeFactory.CreateScope();

      var tokenControlService = scope.ServiceProvider.GetRequiredService<ITokenControlService>();
      var token = await tokenControlService.RegisterProcessTokenAsync(newUser.Id, Processes.ActivateUser);

      var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
      await emailService.sendRegisterEmail(token, newUser);
    });
  }
  #endregion
}
