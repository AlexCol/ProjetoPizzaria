using csharp_p2.src.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
  private readonly IUsersService _usersService;

  public UsersController(IUsersService usersService) {
    _usersService = usersService;
  }

  [HttpGet]
  [EndpointSummary("Listar usuários")]
  [EndpointDescription("Retorna uma lista de todos os usuários cadastrados.")]
  [ProducesResponseType(typeof(IEnumerable<ResponseUserDto>), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  public async Task<ActionResult<IEnumerable<ResponseUserDto>>> GetAllUsersAsync() {
    var users = await _usersService.GetAllUsersAsync();
    return Ok(users);
  }

  [HttpGet("{id}", Name = "GetUserByIdWithReferences")]
  [EndpointSummary("Buscar usuário por id")]
  [EndpointDescription("Retorna um usuário com os relacionamentos carregados.")]
  [ProducesResponseType(typeof(ResponseUserDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<ResponseUserDto>> GetUserByIdWithReferencesAsync(long id) {
    var user = await _usersService.GetUserByIdAsync(id);
    return Ok(user);
  }

  [Authorize(Roles = "Admin")]
  [HttpPost]
  [EndpointSummary("Criar usuário")]
  [EndpointDescription("Cria um novo usuário e envia e-mail de ativação.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> CreateUserAsync([FromBody] CreateUserDto dto) {
    await _usersService.CreateUserAsync(dto);
    return Ok(new MessageDto("User created successfully. Access users email to activate the account."));
  }

  [HttpPatch]
  [Route("{id}")]
  [EndpointSummary("Atualizar usuário")]
  [EndpointDescription("Atualiza os dados de um usuário. Admins podem atualizar qualquer usuário, usuários comuns só podem atualizar seus próprios dados.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status401Unauthorized)]
  [ProducesResponseType(typeof(void), StatusCodes.Status403Forbidden)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> UpdateUserAsync(long id, [FromBody] UpdateUserDto dto) {
    var session = HttpContext.GetSessionPayload();
    var isAdmin = session.User.Role.Name == "Admin";
    var isOwnAccount = session.User.Id == id;

    if (!isAdmin && !isOwnAccount) {
      return Forbid();
    }

    await _usersService.UpdateUserAsync(id, dto);
    return Ok(new MessageDto("User updated successfully."));
  }

  [AllowAnonymous]
  [HttpPost("activate/{token}")]
  [EndpointSummary("Ativar usuário")]
  [EndpointDescription("Ativa a conta com o token enviado por e-mail.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> ActivateUserAsync(string token) {
    var result = await _usersService.ActivateUserAsync(token);
    return Ok(result);
  }

  [AllowAnonymous]
  [HttpPost("resend-activation-email")]
  [EndpointSummary("Reenviar e-mail de ativação")]
  [EndpointDescription("Reenvia o e-mail de ativação para o usuário, caso ele não tenha recebido ou o token tenha expirado.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> ResendActivationEmailAsync([FromBody] EmailDto dto) {
    var result = await _usersService.ResendActivationEmailAsync(dto.Email);
    return Ok(result);
  }

  [AllowAnonymous]
  [HttpPost("send-password-reset-email")]
  [EndpointSummary("Enviar e-mail de recuperação de senha")]
  [EndpointDescription("Envia um e-mail com um token para redefinição de senha.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> SendPasswordResetEmailAsync([FromBody] EmailDto dto) {
    var result = await _usersService.SendPasswordResetEmailAsync(dto.Email);
    return Ok(result);
  }

  [AllowAnonymous]
  [HttpPost("recover-password/{token}")]
  [EndpointSummary("Redefinir senha")]
  [EndpointDescription("Redefine a senha do usuário utilizando o token enviado por e-mail.")]
  [ProducesResponseType(typeof(MessageDto), StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status404NotFound)]
  public async Task<ActionResult<MessageDto>> ResetPasswordAsync(string token, [FromBody] RecoverPasswordDto dto) {
    var result = await _usersService.RecoverPasswordAsync(token, dto);
    return Ok(result);
  }
}
