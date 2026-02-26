using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules;

[ApiController]
[Route("api")]
public class AppController(
  BaseDBContext dbContext
) : ControllerBase {

  [HttpGet("health")]
  public IActionResult Health() {
    dbContext.Database.CanConnect(); // tenta conectar ao banco, se falhar, lança exceção e retorna 500
    return Ok("Healthy");
  }
}
