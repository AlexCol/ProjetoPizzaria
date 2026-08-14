namespace csharp_p2.src.Shared.Middlewares;

public class LogMiddleware { /*para lembrete, middlewares são carregados no app, logo estão no addDependencies do app*/
  private readonly RequestDelegate _next;
  private readonly List<string> _pathsToIgnore = new List<string> {
    "/hangfire/stats"
  };

  public LogMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context) {
    if (!_pathsToIgnore.Contains(context.Request.Path)) {
      Log.Debug("[LogMiddleware] Executando {RequestPath}", context.Request.Path);
    }

    await _next(context);
  }
}
