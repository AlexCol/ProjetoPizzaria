
using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Shared.Middlewares;

public class ExceptionHandlingMiddleware { /*para lembrete, middlewares são carregados no app, logo estão no addDependencies do app*/
  private const string INTERNAL_ERROR_MESSAGE = "An unexpected error occurred. Please try again later.";
  private readonly RequestDelegate _next;

  public ExceptionHandlingMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context) {
    try {
      await _next(context);
    } catch (Exception ex) {
      //! mostrar erro no log
      var traceId = context.TraceIdentifier;
      var statusCode = SetStatusCodeForException(ex);

      if (context.Response.HasStarted) {
        Log.Error(ex, "[ExceptionHandlingMiddleware] Response already started. TraceId: {TraceId}, Path: {Path}", traceId, context.Request.Path);
        throw;
      }

      context.Response.Clear();
      context.Response.StatusCode = statusCode;
      context.Response.ContentType = "application/json";

      var error = new ErrorResponseDto(GetPublicMessage(ex, statusCode), traceId);
      if (statusCode >= StatusCodes.Status500InternalServerError) {
        var message = $"[ExceptionHandlingMiddleware] Internal error. TraceId: {traceId}, Path: {context.Request.Path}, StatusCode: {statusCode}";
        Log.Error(ex, message);
      } else {
        var message = $"[ExceptionHandlingMiddleware] Request rejected. TraceId: {traceId}, Path: {context.Request.Path}, StatusCode: {statusCode}, ErrorType: {ex.GetType().Name}";
        Log.Warning(message);
      }

      //! monta resposta de erro para o cliente
      var jsonResponse = JsonSerializer.Serialize(error);
      await context.Response.WriteAsync(jsonResponse);
    }
  }

  private static int SetStatusCodeForException(Exception ex) {
    return ex switch {
      CustomError customError when customError.Status is >= 400 and <= 599 => customError.Status,
      ArgumentException => StatusCodes.Status400BadRequest,
      UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
      _ => StatusCodes.Status500InternalServerError
    };
  }

  private static string GetPublicMessage(Exception ex, int statusCode) {
    if (statusCode >= StatusCodes.Status500InternalServerError) {
      return INTERNAL_ERROR_MESSAGE;
    }

    // CustomError representa um erro de negócio cuja mensagem foi escrita
    // deliberadamente para ser apresentada ao cliente.
    if (ex is CustomError customError) {
      return customError.Message;
    }

    return statusCode switch {
      StatusCodes.Status400BadRequest => "Invalid request.",
      StatusCodes.Status401Unauthorized => "Unauthorized.",
      _ => "The request could not be completed."
    };
  }
}
