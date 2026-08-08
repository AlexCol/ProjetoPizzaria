using csharp_p2.src.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Domain;

[ApiController]
[Route("api/[controller]")]
public class TokenControlController : ControllerBase {
  private readonly ITokenControlService _tokenControlService;

  public TokenControlController(ITokenControlService tokenControlService) {
    _tokenControlService = tokenControlService;
  }

  [AllowAnonymous]
  [EndpointSummary("Verificar se token é válido")]
  [EndpointDescription("Verifica se o token enviado é válido para o processo de recuperação de senha.")]
  [ProducesResponseType(StatusCodes.Status200OK)]
  [ProducesResponseType(typeof(ErrorResponseDto), StatusCodes.Status400BadRequest)]
  [HttpPost("is-token-valid")]
  public async Task<IActionResult> IsTokenValidAsync([FromBody] TokenDto dto) {
    try {
      await _tokenControlService.GetTokenControlByTokenAndProcessAsync(dto.Token, Processes.PasswordReset);
      return Ok();
    } catch {
      return BadRequest(new { message = "Invalid token." });
    }
  }
}
