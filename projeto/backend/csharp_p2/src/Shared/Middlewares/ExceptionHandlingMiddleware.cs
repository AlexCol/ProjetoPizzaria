using csharp_p2.src.Shared.Responses;
using Shared.Exceptions;

namespace csharp_p2.src.Shared.Middlewares;

public class ExceptionHandlingMiddleware { /*para lembrete, middlewares são carregados no app, logo estão no addDependencies do app*/
  private readonly RequestDelegate _next;

  public ExceptionHandlingMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context) {
    try {
      await _next(context);
    } catch (CustomError ex) {
      context.Response.StatusCode = StatusCodes.Status400BadRequest;
      context.Response.ContentType = "application/json";

      var error = new ErrorResponseDto(ex);
      var result = JsonSerializer.Serialize(error);
      await context.Response.WriteAsync(result);

      Log.Warning($"[ExceptionHandlingMiddleware] - Ocorreu um erro de argumento em: {context.Request.Path}. Erro: {error}");
    } catch (Exception ex) {
      context.Response.StatusCode = StatusCodes.Status500InternalServerError;
      context.Response.ContentType = "application/json";

      var error = new ErrorResponseDto(ex);
      var result = JsonSerializer.Serialize(error);
      await context.Response.WriteAsync(result);

      Log.Error($"[ExceptionHandlingMiddleware] - Ocorreu um erro em: {context.Request.Path}. Erro: {error}");
    }
  }
}
