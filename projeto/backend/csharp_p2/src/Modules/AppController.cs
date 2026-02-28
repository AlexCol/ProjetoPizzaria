using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.builders;
using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace csharp_p2.src.Modules;

[ApiController]
[Route("api")]
public class AppController(
  BaseDBContext dbContext,
  IDistributedCache cache,
  EnvConfig env
) : ControllerBase {

  [HttpGet("health")]
  public async Task<IActionResult> Health() {
    return Ok(new { message = "Healthy", });
  }

  [HttpGet("test-db")]
  public async Task<IActionResult> TestDb() {
    var dbType = env.Database.Type;
    if (dbType == "None")
      return Ok("Healthy: No database configured - " + dbType); // se o tipo de banco for None, retorna 200 com mensagem indicando que não tem banco configurado

    string sql;
    if (dbType == "Postgres") {
      sql = "SELECT 'Im fine, Postgres'"; // consulta simples para testar a conexão com o banco, se falhar, lança exceção e retorna 500
    } else if (dbType == "Oracle") {
      sql = "SELECT 'Im fine, Oracle' FROM DUAL";
    } else {
      return Ok("Healthy: Database type not supported for health check - " + dbType); // se o tipo de banco não for suportado para health check, retorna 200 com mensagem indicando isso
    }

    var response = await dbContext.Database.SqlQueryRaw<string>(sql).ToListAsync(); // tenta fazer uma consulta simples no banco, se falhar, lança exceção e retorna 500
    return Ok(new {
      message = "Healthy: Database is working",
      database = dbType,
      response = response.FirstOrDefault()
    });
  }

  [HttpGet("test-cache")]
  public async Task<IActionResult> TestCache() {
    var cacheKey = "test_cache_key";

    var entryOptions = new DistributedCacheEntryOptions();
    var ttl = TimeSpan.FromSeconds(20);
    var cacheTestOptions = entryOptions.SetAbsoluteExpiration(ttl);

    string cacheValue;
    var cacheHit = false;
    var cachedResponse = await cache.GetStringAsync(cacheKey);

    if (cachedResponse.IsNullOrEmpty()) {
      cacheValue = "This is a test cache value.";
      await cache.SetStringAsync(cacheKey, cacheValue, cacheTestOptions);
    } else {
      cacheValue = cachedResponse;
      cacheHit = true;
    }

    return Ok(new {
      message = "Cache is working",
      cacheValue,
      cacheHit,
      cacheType = env.Cache.Type
    });
  }
}
