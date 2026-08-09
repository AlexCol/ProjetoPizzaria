using csharp_p2.src.Shared.Exceptions;
using csharp_p2.src.Shared.Atributtes;
using csharp_p2.src.Shared.Constants;
using Microsoft.AspNetCore.Antiforgery;

namespace csharp_p2.src.Shared.Middlewares;

public class CsrfProtectionMiddleware {
  private readonly RequestDelegate _next;

  public CsrfProtectionMiddleware(RequestDelegate next) {
    _next = next;
  }

  public async Task InvokeAsync(HttpContext context, IAntiforgery antiforgery) {
    if (!RequiresValidation(context)) {
      await _next(context);
      return;
    }

    try {
      await antiforgery.ValidateRequestAsync(context);
    } catch (AntiforgeryValidationException) {
      throw new CustomError("Invalid or missing CSRF token.", StatusCodes.Status400BadRequest);
    }

    await _next(context);
  }

  private static bool RequiresValidation(HttpContext context) {
    var request = context.Request;
    var isUnsafeMethod = HttpMethods.IsPost(request.Method)
      || HttpMethods.IsPut(request.Method)
      || HttpMethods.IsPatch(request.Method)
      || HttpMethods.IsDelete(request.Method);

    if (!isUnsafeMethod) return false;

    // Authorization é enviado explicitamente por clientes mobile e não acompanha
    // requisições forjadas automaticamente, portanto não precisa de antiforgery.
    var usesAuthorizationHeader = !string.IsNullOrWhiteSpace(request.Headers.Authorization);
    if (usesAuthorizationHeader) return false;

    // Algumas operações precisam de CSRF antes mesmo de o cookie existir. O login
    // web é o exemplo atual: ele cria o cookie e declara essa necessidade através
    // de RequireCsrfProtectionAttribute, sem acoplar o middleware à URL da action.
    var requiresExplicitValidation = context
      .GetEndpoint()?
      .Metadata
      .GetMetadata<RequireCsrfProtectionAttribute>() is not null;

    // Nas demais operações, a proteção é exigida quando o navegador autentica
    // pelo cookie anexado automaticamente, que constitui o vetor de CSRF.
    return requiresExplicitValidation
      || request.Cookies.ContainsKey(SessionConstants.SESSION_TOKEN);
  }
}
