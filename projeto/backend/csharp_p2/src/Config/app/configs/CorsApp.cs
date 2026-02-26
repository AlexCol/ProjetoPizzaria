
namespace csharp_p2.src.Config.App;

public static class CorsApp {
  public static void AddCors(WebApplication app) {
    app.UseCors(); //para ativar o cors
                   //app.UseCors("CORSAllowLocalHost");
  }
}
