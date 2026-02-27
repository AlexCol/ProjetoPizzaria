using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules;

[ApiController]
[Route("api")]
public class AppController(
  BaseDBContext dbContext,
  EnvConfig env
) : ControllerBase {

  [HttpGet("health")]
  public async Task<IActionResult> Health() {
    var dbType = env.Database.Type;
    if (dbType == "None")
      return Ok("Healthy: No database configured - " + dbType); // se o tipo de banco for None, retorna 200 com mensagem indicando que não tem banco configurado

    string sql;
    if (dbType == "Postgres") {
      sql = "SELECT 1";
    } else if (dbType == "Oracle") {
      sql = "SELECT 1 FROM DUAL";
    } else {
      return Ok("Healthy: Database type not supported for health check - " + dbType); // se o tipo de banco não for suportado para health check, retorna 200 com mensagem indicando isso
    }

    var response = await dbContext.Database.SqlQueryRaw<int>(sql).ToListAsync(); // tenta fazer uma consulta simples no banco, se falhar, lança exceção e retorna 500
    return Ok("Healthy: " + response[0] + " - " + dbType); // se tudo der certo, retorna 200 com a resposta do banco e o valor da configuração
  }
}
