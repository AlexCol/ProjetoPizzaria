using csharp_p2.src.Config;

namespace csharp_p2.src.Modules.Infra.Cache;

public static partial class CacheBuilder {
  public static string Cache { get; private set; } = "";

  public static void AddCache(WebApplicationBuilder builder, EnvConfig env) {
    var enumValido = Enum.TryParse<ECacheType>(env.Cache.Type, true, out var cache) && Enum.IsDefined(cache);

    if (!enumValido)
      throw new Exception("[CacheBuilder] - Cache not defined!");

    Cache = cache.ToString();

    //se adicionar mais, lembrar de olhar o context, tem coisa especifica de banco lá tbm
    if (cache == ECacheType.Memory) {
      builder.AddMemoryCacheInfra();
    } else if (cache == ECacheType.Redis || cache == ECacheType.Valkey) {
      builder.AddRedisCache(env);
    } else
      throw new Exception($"[CacheBuilder] - Process for {cache} not created!");
  }
}

// Para usar, injete ICacheClient; o builder registra a implementação correspondente ao CACHE_TYPE.
