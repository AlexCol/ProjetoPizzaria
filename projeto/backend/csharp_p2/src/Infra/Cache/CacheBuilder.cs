using csharp_p2.src.Config;
using csharp_p2.src.Infra.Cache.Enumerators;
using csharp_p2.src.Infra.Cache.Builders.Redis;

namespace csharp_p2.src.Infra.Cache;

public static partial class CacheBuilder {
  public static string Cache { get; private set; } = "";

  public static void AddCache(WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration);
    var enumValido = Enum.TryParse<ECacheType>(env.Cache.Type, true, out var cache) && Enum.IsDefined(cache);

    if (!enumValido)
      throw new Exception("[CacheBuilder] - Cache not defined!");

    Cache = cache.ToString();

    //se adicionar mais, lembrar de olhar o context, tem coisa especifica de banco lá tbm
    if (cache == ECacheType.Memory) {
      builder.Services.AddMemoryCache();
    } else if (cache == ECacheType.Redis) {
      builder.AddRedisCache(env);
    } else
      throw new Exception($"[CacheBuilder] - Process for {cache} not created!");
  }
}

//para usar, injetar: IDistributedCache, e usar os métodos de lá, tem que ser async
