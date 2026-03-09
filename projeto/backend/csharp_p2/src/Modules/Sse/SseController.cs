using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Sse;

[ApiController]
[Route("api/sse")]
[Authorize]
public class SseController : ControllerBase {
  private readonly ISseService _sseService;
  private readonly IHostApplicationLifetime _appLifetime;

  public SseController(ISseService sseService, IHostApplicationLifetime appLifetime) {
    _sseService = sseService;
    _appLifetime = appLifetime;
  }

  [HttpGet("connect")]
  [EndpointSummary("Estabelece uma conexão SSE para o usuário autenticado.")]
  [EndpointDescription("Este endpoint é usado para estabelecer uma conexão SSE (Server-Sent Events) para o usuário autenticado. O cliente deve manter a conexão aberta para receber eventos em tempo real do servidor.")]
  public async Task Connect(CancellationToken ct) {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrWhiteSpace(userId)) {
      Response.StatusCode = StatusCodes.Status401Unauthorized;
      return;
    }

    using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _appLifetime.ApplicationStopping);
    await _sseService.ConnectAsync(userId, HttpContext, linkedCts.Token);
  }

  [Authorize(Roles = "Admin")]
  [HttpGet("status")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public IActionResult Status() => Ok(_sseService.GetActiveConnections());

  [Authorize(Roles = "Admin")]
  [HttpPost("send-message/{userId}")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public async Task<IActionResult> SendMessageToUserId(
    [FromRoute] string userId,
    [FromBody] SseMessageDto sseEvent, CancellationToken ct
  ) {
    var enumEvent = _sseService.TransformEventOrThrow(sseEvent.Event);
    await _sseService.SendToUserAsync(userId, enumEvent, sseEvent.Data, ct);

    return Ok(new { Message = "Evento enviado para o usuário.", Event = sseEvent });
  }

  [Authorize(Roles = "Admin")]
  [HttpPost("send-message/all")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public async Task<IActionResult> SendMessageToAll(
  [FromBody] SseMessageDto sseEvent, CancellationToken ct
) {
    var enumEvent = _sseService.TransformEventOrThrow(sseEvent.Event);
    await _sseService.SendToAllAsync(enumEvent, sseEvent.Data, ct);

    return Ok(new { Message = "Evento enviado para todos os usuários", Event = sseEvent });
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("remove-connection/{userId}")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public IActionResult RemoveConnection(
    [FromRoute] string userId, CancellationToken ct
  ) {
    if (string.IsNullOrWhiteSpace(userId)) {
      return Unauthorized();
    }

    _sseService.DisconnectUser(userId);
    return Ok(new { Message = "Conexão removida para o usuário", UserId = userId });
  }
}
