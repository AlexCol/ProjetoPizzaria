using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules;

[ApiController]
[Route("api")]
public class AppController : ControllerBase {
  private readonly IAppService _appService;

  public AppController(IAppService appService) {
    _appService = appService;
  }

  [AllowAnonymous]
  [HttpGet("health")]
  public async Task<IActionResult> HealthAsync() {
    var response = _appService.HealthCheck();
    return Ok(response);
  }

  [HttpGet("test-db")]
  public async Task<IActionResult> TestDbAsync() {
    var response = _appService.TestDb();
    return Ok(response);
  }

  [HttpGet("test-cache")]
  public async Task<IActionResult> TestCacheAsync() {
    var response = await _appService.TestCache();
    return Ok(response);
  }

  [AllowAnonymous]
  [HttpPost("run-seeds")]
  public async Task<IActionResult> RunSeedsAsync() {
    await _appService.RunSeedsAsync();
    return Ok(new { message = "Seeds executed successfully" });
  }
}
