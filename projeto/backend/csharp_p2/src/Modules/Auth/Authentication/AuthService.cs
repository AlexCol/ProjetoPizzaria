using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.VOs;

namespace csharp_p2.src.Modules.Auth.Authentication;

public interface IAuthService {
  Task<CreateUserSessionResponse> LoginAsync(LoginDto loginDto);
}

public class AuthService : IAuthService {
  private readonly IUsersService _usersService;
  private readonly ISessionService _sessionService;

  public AuthService(IUsersService usersService, ISessionService sessionService) {
    _usersService = usersService;
    _sessionService = sessionService;
  }

  public async Task<CreateUserSessionResponse> LoginAsync(LoginDto loginDto) {
    var user = await ObtemUsuarioAsync(loginDto);
    var sessionData = await _sessionService.CreateSession(user);
    return sessionData;
  }

  private async Task<User> ObtemUsuarioAsync(LoginDto loginDto) {
    var user = await _usersService.GetEntityByEmailWithPasswordAsync(new EmailVO(loginDto.Email));
    if (user == null) throw new UnauthorizedAccessException("Usuário ou senha incorretos.");

    await LoginValidationAsync(loginDto, user);

    return user;

  }

  private async Task LoginValidationAsync(LoginDto loginDto, User user) {
    if (user.Status == EUserStatus.Inactive) throw new Exception("Usuário inativo");
    if (user.Status == EUserStatus.Blocked) throw new Exception("Usuário bloqueado");

    var passwordMatch = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
    if (!passwordMatch) throw new UnauthorizedAccessException("Usuário ou senha incorretos.");
  }
}
