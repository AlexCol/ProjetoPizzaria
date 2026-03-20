using csharp_p2.src.Modules.Infra.Email;
using csharp_p2.src.Modules.Session;
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
  Task<MessageDto> ActivateUserAsync(string token);
  Task<MessageDto> ResendActivationEmailAsync(string email);
  Task<MessageDto> SendPasswordResetEmailAsync(string email);
  Task<MessageDto> RecoverPasswordAsync(string token, RecoverPasswordDto dto);
}

public class UsersService : IUsersService {
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly IServiceProvider _serviceProvider;

  public UsersService(IGenericEntityRepository<User> userRepository, IServiceProvider serviceProvider) {
    _userRepository = userRepository;
    _serviceProvider = serviceProvider;
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
      throw new CustomError("User not found.", 404);
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

    var roleService = _serviceProvider.GetRequiredService<IRolesService>();
    var role = await roleService.GetRoleByIdAsync(dto.RoleId.Value);
    if (role == null) {
      throw new CustomError("Role not found.", 404);
    }

    var newUser = new User {
      Email = dtoEmailVO,
      Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
      Name = dto.Name,
      RoleId = dto.RoleId.Value,
      Status = EUserStatus.Inactive //? usuário criado como inativo, precisa ativar por email
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
    var updated = false;
    var userToUpdate = await _userRepository.GetByIdAsync(id);
    if (userToUpdate == null) {
      throw new CustomError("User not found.", 404);
    }

    if (dto.Name != null && dto.Name != userToUpdate.Name) {
      userToUpdate.Name = dto.Name;
      updated = true;
    }

    if (dto.RoleId != 0 && dto.RoleId != userToUpdate.RoleId) {
      userToUpdate.RoleId = dto.RoleId;
      updated = true;
    }

    if (!updated) {
      throw new CustomError("No fields to update.");
    }

    var updatedUser = await _userRepository
            .UpdateAsync(userToUpdate)
            .ContinueWith(task => task.Result ? userToUpdate : throw new Exception("Failed to update user: " + task.Exception?.Message));

    var userWithRole = await _userRepository.GetByIdWithReferencesAsync(updatedUser.Id); //? para retornar o role junto no dto

    await SendSessionUpdateNotificationAsync(updatedUser.Id);

    return new ResponseUserDto(userWithRole);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!

  public async Task<MessageDto> ActivateUserAsync(string token) {
    using var trx = await _userRepository.BeginTransactionAsync();
    try {
      var tokenControlService = _serviceProvider.GetRequiredService<ITokenControlService>();
      var tokenControl = await tokenControlService.GetTokenControlByTokenAsync(token);

      var user = await _userRepository.GetByIdAsync(tokenControl.IdObject);
      if (user == null) {
        throw new CustomError("User not found.", 404);
      }

      if (user.Status != EUserStatus.Inactive) {
        throw new CustomError("User is not inactive.");
      }

      user.Status = EUserStatus.Active;
      await _userRepository.UpdateAsync(user);
      await tokenControlService.RemoveTokenControlAsync(tokenControl);

      await trx.CommitAsync();
      return new MessageDto("User activated successfully. You can now log in.");
    } catch (Exception ex) {
      await trx.RollbackAsync();
      throw new CustomError("Failed to activate user: " + ex.Message);
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!

  public async Task<MessageDto> ResendActivationEmailAsync(string email) {
    var user = await GetEntityByEmailWithPasswordAsync(new EmailVO(email));
    if (user == null) {
      throw new CustomError("User not found.", 404);
    }

    if (user.Status == EUserStatus.Active) {
      throw new CustomError("User is already active.");
    }

    await SendEmailForActivationAsync(user);
    return new MessageDto("Activation email resent successfully. Please check your email.");
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!

  public async Task<MessageDto> SendPasswordResetEmailAsync(string email) {
    var user = await GetEntityByEmailWithPasswordAsync(new EmailVO(email));
    if (user == null) {
      throw new CustomError("User not found.", 404);
    }

    if (user.Status != EUserStatus.Active) {
      throw new CustomError("User is not active.");
    }

    await SendEmailForPasswordResetAsync(user);
    return new MessageDto("Password reset email sent successfully. Please check your email.");
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!

  public async Task<MessageDto> RecoverPasswordAsync(string token, RecoverPasswordDto dto) {
    using var trx = await _userRepository.BeginTransactionAsync();
    try {
      var tokenControlService = _serviceProvider.GetRequiredService<ITokenControlService>();
      var tokenControl = await tokenControlService.GetTokenControlByTokenAsync(token);
      if (tokenControl.ExpiresAt < DateTime.UtcNow) {
        throw new CustomError("Token has expired.");
      }

      var user = await _userRepository.GetByIdAsync(tokenControl.IdObject);
      if (user == null) {
        throw new CustomError("User not found.", 404);
      }

      if (dto.Password != dto.ConfirmPassword) {
        throw new CustomError("Password and Confirm Password do not match.");
      }

      user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
      await _userRepository.UpdateAsync(user);
      await tokenControlService.RemoveTokenControlAsync(tokenControl);

      await trx.CommitAsync();
      return new MessageDto("Password reset successfully. You can now log in with your new password.");
    } catch (Exception ex) {
      await trx.RollbackAsync();
      throw new CustomError("Failed to reset password: " + ex.Message);
    }
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Private Methods
  #region Private Methods
  private async Task SendSessionUpdateNotificationAsync(long userId) {
    var sessionService = _serviceProvider.GetRequiredService<ISessionService>();
    await sessionService.SendSessionUpdateNotificationAsync(userId);
  }
  #endregion

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SendEmail
  #region SendEmail
  private async Task SendEmailForActivationAsync(User newUser) {
    _ = Task.Run(async () => {
      var scopeFactory = _serviceProvider.GetRequiredService<IServiceScopeFactory>();
      using var scope = scopeFactory.CreateScope();

      var tokenControlService = scope.ServiceProvider.GetRequiredService<ITokenControlService>();
      var token = await tokenControlService.RegisterProcessTokenAsync(newUser.Id, Processes.ActivateUser);

      var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
      await emailService.SendRegisterEmailAsync(token, newUser);
    });
  }

  private async Task SendEmailForPasswordResetAsync(User user) {
    _ = Task.Run(async () => {
      var scopeFactory = _serviceProvider.GetRequiredService<IServiceScopeFactory>();
      using var scope = scopeFactory.CreateScope();

      var tokenControlService = scope.ServiceProvider.GetRequiredService<ITokenControlService>();
      var token = await tokenControlService.RegisterProcessTokenAsync(user.Id, Processes.PasswordReset, DateTime.UtcNow.AddMinutes(10));

      var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
      await emailService.SendRecoverPasswordEmailAsync(token, user.Email.Value);
    });
  }
  #endregion
}
