using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Entities;
using csharp_p2.src.Modules.Session;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.VOs;

namespace csharp_p2.src.Modules.Auth.Authentication;

public interface IAuthService {
  Task<CreateUserSessionResponse> Login(LoginDto loginDto);
}

public class AuthService : IAuthService {
  public readonly IUsersService _usersService;
  public readonly ISessionService _sessionService;

  public AuthService(IUsersService usersService, ISessionService sessionService) {
    _usersService = usersService;
    _sessionService = sessionService;
  }

  public async Task<CreateUserSessionResponse> Login(LoginDto loginDto) {
    var user = await ObtemUsuario(loginDto);
    var sessionData = await _sessionService.CreateSession(user);
    return sessionData;
  }

  private async Task<User> ObtemUsuario(LoginDto loginDto) {
    var user = await _usersService.GetEntityByEmailWithPasswordAsync(new EmailVO(loginDto.Email));
    if (user == null) throw new UnauthorizedAccessException("Usuário ou senha incorretos.");

    await LoginValidation(loginDto, user);

    return user;

  }

  private async Task LoginValidation(LoginDto loginDto, User user) {
    if (user.Status == (int)EUserStatus.Inactive) throw new Exception("Usuário inativo");
    if (user.Status == (int)EUserStatus.Blocked) throw new Exception("Usuário bloqueado");

    var passwordMatch = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
    if (!passwordMatch) throw new UnauthorizedAccessException("Usuário ou senha incorretos.");
  }
}
