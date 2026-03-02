namespace csharp_p2.src.Modules.Infra.Cache.Builders.Memory;

public static class MemoryCacheBuilder {
  public static void AddMemoryCacheInfra(this WebApplicationBuilder builder) {
    builder.Services.AddMemoryCache();
    builder.Services.AddSingleton<ICacheClient, MemoryCacheClient>();
  }
}
