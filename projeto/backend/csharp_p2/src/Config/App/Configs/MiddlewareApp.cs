using csharp_p2.src.Shared.Middlewares;

namespace csharp_p2.src.Config.App;

public static class MiddlewareApp {
  public static void AddMiddlewares(WebApplication app) {
    //!adicionando middlewares, importante pois a ordem em que forem declarados, serão executados
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<LogMiddleware>();
  }
}
