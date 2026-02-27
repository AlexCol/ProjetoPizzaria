using csharp_p2.src.Config;

namespace csharp_p2.src.Infra.Cache.Builders.Redis;

public static class RedisCacheBuilder {
  public static void AddRedisCache(this WebApplicationBuilder builder, EnvConfig env) {
    builder.Services.AddStackExchangeRedisCache(options => {
      options.Configuration = $"{env.Cache.Host}:{env.Cache.Port}";
      if (!string.IsNullOrEmpty(env.Cache.Password)) {
        options.Configuration += $",password={env.Cache.Password}";
      }
    });
  }
}
