using csharp_p2.src.Config;
using csharp_p2.src.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace csharp_p2.src.Modules;

[ApiController]
[Route("api")]
public class AppController : ControllerBase {
  private readonly IAppService _appService;
  private readonly EnvConfig _envConfig;

  public AppController(IAppService appService, EnvConfig envConfig) {
    _appService = appService;
    _envConfig = envConfig;
  }

  [AllowAnonymous]
  [HttpGet("health")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public async Task<IActionResult> HealthAsync() {
    var healthResponse = new HealthCheck {
      Api = new ApiHealthCheck { Message = "Healthy" },
      DataBase = _appService.TestDb(),
      Cache = await _appService.TestCacheAsync()
    };
    return Ok(healthResponse);
  }

  // [HttpGet("test-db")]
  // [ApiExplorerSettings(IgnoreApi = true)]
  // public async Task<IActionResult> TestDbAsync() {
  //   var response = _appService.TestDb();
  //   return Ok(response);
  // }

  // [HttpGet("test-cache")]
  // [ApiExplorerSettings(IgnoreApi = true)]
  // public async Task<IActionResult> TestCacheAsync() {
  //   var response = await _appService.TestCache();
  //   return Ok(response);
  // }

  [AllowAnonymous]
  [HttpPost("run-seeds")]
  [ApiExplorerSettings(IgnoreApi = true)]
  public async Task<IActionResult> RunSeedsAsync() {
    if (!_envConfig.IsDevelopment) {
      return BadRequest(new { message = "Seeds can only be executed in development environment" });
    }
    await _appService.RunSeedsAsync();
    return Ok(new { message = "Seeds executed successfully" });
  }

  // [AllowAnonymous]
  // [HttpPost("test-search")]
  // [ApiExplorerSettings(IgnoreApi = true)]
  // public async Task<IActionResult> TestSearchAsync([FromBody] SearchCriteriaRequest<CategoriesDto> request) {
  //   throw new CustomError("bah");
  //   //return Ok("ok");
  // }
}
