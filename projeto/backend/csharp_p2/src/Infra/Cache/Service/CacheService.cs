using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using csharp_p2.src.Config;
using Microsoft.Extensions.Caching.Distributed;

namespace csharp_p2.src.Infra.Cache.Service;

public interface ICacheService {

}

public class CacheService : ICacheService {
  private readonly IDistributedCache _cache;
  private readonly EnvConfig _env;

  public CacheService(IDistributedCache cache, EnvConfig env) {
    _cache = cache;
    _env = env;
  }
}
