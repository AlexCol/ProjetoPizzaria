namespace csharp_p2.src.Shared.DTOs;

public class HealthCheck {
  public ApiHealthCheck Api { get; set; }
  public DatabaseHealthCheck DataBase { get; set; }
  public CacheHealthCheck Cache { get; set; }
}

public record ApiHealthCheck {
  public string Message { get; set; }
}

public record DatabaseHealthCheck {
  public string Message { get; set; }
  public string Type { get; set; }
  public string Response { get; set; }
}

public record CacheHealthCheck {
  public string Message { get; set; }
  public string Type { get; set; }
  public bool CacheHit { get; set; }
  public string CacheValue { get; set; }
}
