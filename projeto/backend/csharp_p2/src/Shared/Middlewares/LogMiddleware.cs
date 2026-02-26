namespace csharp_p2.src.Shared.Middlewares;

public class LogMiddleware { /*para lembrete, middlewares são carregados no app, logo estão no addDependencies do app*/
  private readonly RequestDelegate _next;

  public LogMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context) {
    Log.Information($"[LogMiddleware] - Executando {context.Request.Path}");
    await _next(context);
  }
}
