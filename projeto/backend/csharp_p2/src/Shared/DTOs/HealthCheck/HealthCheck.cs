namespace csharp_p2.src.Shared.DTOs;

public class HealthCheck {
  public ApiHealthCheck Api { get; set; } = new();
  public DatabaseHealthCheck DataBase { get; set; } = new();
  public CacheHealthCheck Cache { get; set; } = new();
}

public record ApiHealthCheck {
  public string Message { get; set; } = string.Empty;
}

public record DatabaseHealthCheck {
  public string Message { get; set; } = string.Empty;
  public string Type { get; set; } = string.Empty;
  public string? Response { get; set; }
}

public record CacheHealthCheck {
  public string Message { get; set; } = string.Empty;
  public string Type { get; set; } = string.Empty;
  public bool CacheHit { get; set; }
  public string? CacheValue { get; set; }
}
