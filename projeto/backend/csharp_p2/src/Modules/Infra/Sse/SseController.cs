using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules.Infra.Sse;

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
  public async Task Connect(CancellationToken ct) {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrWhiteSpace(userId)) {
      Response.StatusCode = StatusCodes.Status401Unauthorized;
      return;
    }

    using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(ct, _appLifetime.ApplicationStopping);
    await _sseService.ConnectAsync(userId, HttpContext, linkedCts.Token);
  }

  [HttpGet("status")]
  [Authorize(Roles = "Admin")]
  public IActionResult Status() => Ok(_sseService.GetActiveConnections());

  [Authorize(Roles = "Admin")]
  [HttpPost("send-message/{userId}")]
  public async Task<IActionResult> SendTestMessage(
    [FromRoute] string userId,
    [FromBody] SseMessage sseEvent, CancellationToken ct
  ) {
    if (string.IsNullOrWhiteSpace(userId)) {
      return Unauthorized();
    }

    var message = new SseMessage(sseEvent.Event, sseEvent.Data);
    await _sseService.SendToUserAsync(userId, message, ct);

    return Ok(new { Message = "Evento enviado para o usuário", Event = sseEvent });
  }

  [Authorize(Roles = "Admin")]
  [HttpDelete("remove-connection/{userId}")]
  public async Task<IActionResult> RemoveConnection(
    [FromRoute] string userId, CancellationToken ct
  ) {
    if (string.IsNullOrWhiteSpace(userId)) {
      return Unauthorized();
    }

    await _sseService.DisconnectUserAsync(userId);
    return Ok(new { Message = "Conexão removida para o usuário", UserId = userId });
  }
}
