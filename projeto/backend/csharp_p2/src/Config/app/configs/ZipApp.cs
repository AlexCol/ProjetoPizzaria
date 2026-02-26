namespace csharp_p2.src.Config.App;

public static class ZippApp {
  public static void AddZipp(WebApplication app) {
    app.UseResponseCompression(); // <--- ativa compressão
  }
}
