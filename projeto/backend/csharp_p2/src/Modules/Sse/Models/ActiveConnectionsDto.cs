namespace csharp_p2.src.Modules.Sse;

public class ActiveConnectionsDto {
  public Dictionary<string, int> ActiveConnections { get; set; } = new();
  public int TotalUsers { get; set; }
}
