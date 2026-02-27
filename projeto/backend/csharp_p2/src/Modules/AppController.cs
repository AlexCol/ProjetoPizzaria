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
      sql = "SELECT 'Im fine'";
    } else if (dbType == "Oracle") {
      sql = "SELECT 'Im fine' FROM DUAL";
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
    string cacheValue;
    var cachedResponse = await cache.GetStringAsync(cacheKey);

    if (cachedResponse.IsNullOrEmpty()) {
      cacheValue = "This is a test cache value.";
      var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(60)); // define um tempo de expiração para a chave do cache

      cacheValue = cachedResponse;

    } else {
      cacheValue = "This is a test cache value - " + env.Cache.Type; // se o cache não tiver a resposta, cria uma nova indicando que o cache está funcionando e o tipo de cache configurado
      var options = new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromSeconds(60)); // define um tempo de expiração para a chave do cache
      await cache.SetStringAsync(cacheKey, cacheValue, options); // armazena a resposta no cache
      Log.Information("[TestCache] - Cache miss for key {CacheKey}. Setting value: {CacheValue}", cacheKey, cacheValue); // loga que teve um cache miss e qual valor foi setado
    }

    return Ok(new {
      message = "Healthy: Cache is working",
      cache = env.Cache.Type + " - " + cacheValue
    }); // se tudo der certo, retorna 200 com a resposta do banco e o valor da configuração
  }
}
