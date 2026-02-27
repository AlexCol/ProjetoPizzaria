namespace csharp_p2.src.Config.App;

public static class ZipApp {
  public static void AddZip(WebApplication app) {
    app.UseResponseCompression(); // <--- ativa compressão
  }
}
