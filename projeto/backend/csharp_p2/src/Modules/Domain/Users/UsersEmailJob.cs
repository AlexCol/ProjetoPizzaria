using csharp_p2.src.Config.Builder;
using csharp_p2.src.Modules.Infra.Email;

namespace csharp_p2.src.Modules.Domain;

public interface IUsersEmailJob {
  Task SendActivationEmailAsync(long userId);
  Task SendPasswordResetEmailAsync(long userId);
}

[Injectable(typeof(IUsersEmailJob), EServiceLifetimeType.Scoped)]
public class UsersEmailJob : IUsersEmailJob {
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly ITokenControlService _tokenControlService;
  private readonly IEmailService _emailService;

  public UsersEmailJob(
    IGenericEntityRepository<User> userRepository,
    ITokenControlService tokenControlService,
    IEmailService emailService
  ) {
    _userRepository = userRepository;
    _tokenControlService = tokenControlService;
    _emailService = emailService;
  }

  public async Task SendActivationEmailAsync(long userId) {
    try {
      Log.Debug($"Starting to send activation email for userId: {userId}");
      var user = await _userRepository.GetByIdAsync(userId);
      if (user is null) return;

      var token = await _tokenControlService.RegisterProcessTokenAsync(user.Id, Processes.ActivateUser);
      await _emailService.SendRegisterEmailAsync(token, user);
    } catch (Exception ex) {
      Log.Error($"Error sending activation email: {ex.Message}");
      throw;
    }
  }

  public async Task SendPasswordResetEmailAsync(long userId) {
    try {
      Log.Debug($"Starting to send password reset email for userId: {userId}");
      var user = await _userRepository.GetByIdAsync(userId);
      if (user is null) return;

      var token = await _tokenControlService.RegisterProcessTokenAsync(user.Id, Processes.PasswordReset, DateTime.UtcNow.AddMinutes(10));
      await _emailService.SendRecoverPasswordEmailAsync(token, user.Email.Value);
    } catch (Exception ex) {
      Log.Error($"Error sending password reset email: {ex.Message}");
      throw;
    }
  }
}
