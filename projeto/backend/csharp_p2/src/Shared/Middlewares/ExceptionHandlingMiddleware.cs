
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
    } catch (Exception ex) {
      context.Response.StatusCode = SetStatusCodeForException(ex);
      exception = ex;
    }

    if (exception is not null) {
      var error = new ErrorResponseDto(exception);
      var message = error.ErrorMessage[0];
      context.Response.ContentType = "application/json";

      var jsonResponse = JsonSerializer.Serialize(new { message });
      await context.Response.WriteAsync(jsonResponse);
      Log.Error($"[ExceptionHandlingMiddleware] - Ocorreu um erro em: {context.Request.Path}. Erro: {error}");
    }
  }

  private int SetStatusCodeForException(Exception ex) {
    return ex switch {
      CustomError => (ex as CustomError).Status,
      ArgumentException => StatusCodes.Status400BadRequest,
      UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
      _ => StatusCodes.Status500InternalServerError
    };
  }
}
