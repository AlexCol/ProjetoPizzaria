using csharp_p2.src.Config;
using Microsoft.Extensions.Caching;
using StackExchange.Redis;

namespace csharp_p2.src.Modules.Infra.Cache;

public static class RedisCacheBuilder {
  public static void AddRedisCache(this WebApplicationBuilder builder, EnvConfig env) {
    var configuration = $"{env.Cache.Host}:{env.Cache.Port}";
    if (!string.IsNullOrEmpty(env.Cache.Password)) {
      configuration += $",password={env.Cache.Password}";
    }

    // Registra o multiplexer (conexão com Redis) - que é usada em RedisCacheClient
    builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
      ConnectionMultiplexer.Connect(configuration));

    builder.Services.AddSingleton<ICacheClient, RedisCacheClient>();
  }
}
