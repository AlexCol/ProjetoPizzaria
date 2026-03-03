
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Shared.Middlewares;

public class ExceptionHandlingMiddleware { /*para lembrete, middlewares são carregados no app, logo estão no addDependencies do app*/
  private readonly RequestDelegate _next;

  public ExceptionHandlingMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context) {
    Exception exception = null;
    try {
      await _next(context);
    } catch (CustomError ex) {
      context.Response.StatusCode = StatusCodes.Status400BadRequest;
      exception = ex;
    } catch (UnauthorizedAccessException ex) {
      context.Response.StatusCode = StatusCodes.Status401Unauthorized;
      exception = ex;
    } catch (Exception ex) {
      context.Response.StatusCode = StatusCodes.Status500InternalServerError;
      exception = ex;
    }

    if (exception is not null) {
      var error = new ErrorResponseDto(exception);
      var result = JsonSerializer.Serialize(error);
      context.Response.ContentType = "application/json";
      await context.Response.WriteAsync(result);
      Log.Error($"[ExceptionHandlingMiddleware] - Ocorreu um erro em: {context.Request.Path}. Erro: {error}");
    }
  }
}
