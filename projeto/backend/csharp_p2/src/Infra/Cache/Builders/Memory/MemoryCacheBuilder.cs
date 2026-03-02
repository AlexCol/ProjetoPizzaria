using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace csharp_p2.src.Infra.Cache.Builders.Memory;

public static class MemoryCacheBuilder {
  public static void AddMemoryCacheInfra(this WebApplicationBuilder builder) {
    builder.Services.AddMemoryCache();
    builder.Services.AddSingleton<ICacheClient, MemoryCacheClient>();
  }
}
