using System.Threading.RateLimiting;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.RateLimiting;

namespace csharp_p2.src.Config.Builder;

public static class RateLimitBuilder {
  public static void AddRateLimiting(WebApplicationBuilder builder) {
    var config = builder.Configuration.GetSection("RateLimiting");

    var loginLimit = GetLimit(config, "Login", 5, 60);
    var emailDeliveryLimit = GetLimit(config, "EmailDelivery", 3, 900);
    var tokenOperationLimit = GetLimit(config, "TokenOperation", 10, 60);

    builder.Services.AddRateLimiter(options => {
      options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

      options.AddPolicy(RateLimitPolicies.LOGIN, context =>
        CreateFixedWindowPartition(context, loginLimit)
      );

      options.AddPolicy(RateLimitPolicies.EMAIL_DELIVERY, context =>
        CreateFixedWindowPartition(context, emailDeliveryLimit)
      );

      options.AddPolicy(RateLimitPolicies.TOKEN_OPERATION, context =>
        CreateFixedWindowPartition(context, tokenOperationLimit)
      );

      options.OnRejected = async (context, cancellationToken) => {
        var response = context.HttpContext.Response;
        response.StatusCode = StatusCodes.Status429TooManyRequests;
        response.ContentType = "application/json";

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)) {
          response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds)
            .ToString(CultureInfo.InvariantCulture);
        }

        var error = new ErrorResponseDto("Too many requests. Please try again later.");
        await response.WriteAsync(JsonSerializer.Serialize(error), cancellationToken);

        Log.Warning(
          "[RateLimit] Limite excedido para IP {ClientIp} na rota {RequestPath}",
          GetClientIp(context.HttpContext),
          context.HttpContext.Request.Path
        );
      };
    });
  }

  private static RateLimitPartition<string> CreateFixedWindowPartition(
    HttpContext context,
    RateLimitConfig config
  ) {
    return RateLimitPartition.GetFixedWindowLimiter(
      partitionKey: GetClientIp(context),
      factory: _ => new FixedWindowRateLimiterOptions {
        PermitLimit = config.PermitLimit,
        Window = TimeSpan.FromSeconds(config.WindowSeconds),
        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        QueueLimit = 0,
        AutoReplenishment = true
      }
    );
  }

  private static string GetClientIp(HttpContext context) {
    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
  }

  private static RateLimitConfig GetLimit(
    IConfigurationSection config,
    string policyName,
    int defaultPermitLimit,
    int defaultWindowSeconds
  ) {
    var permitLimit = config.GetValue($"{policyName}:PermitLimit", defaultPermitLimit);
    var windowSeconds = config.GetValue($"{policyName}:WindowSeconds", defaultWindowSeconds);

    if (permitLimit <= 0 || windowSeconds <= 0) {
      throw new InvalidOperationException(
        $"RateLimiting:{policyName} must have positive PermitLimit and WindowSeconds values."
      );
    }

    return new RateLimitConfig(permitLimit, windowSeconds);
  }

  private sealed record RateLimitConfig(int PermitLimit, int WindowSeconds);
}

/*
 * FLUXO DO RATE LIMITING
 *
 * 1. RateLimitPolicies define constantes que identificam cada política:
 *    Login, EmailDelivery e TokenOperation.
 *    As constantes são apenas nomes; elas não armazenam limites ou tempos.
 *
 * 2. Este builder lê do appsettings.json a quantidade permitida (PermitLimit)
 *    e a duração da janela (WindowSeconds) de cada política.
 *
 * 3. AddRateLimiter registra as políticas no container do ASP.NET Core e
 *    associa cada nome a um limitador de janela fixa, separado pelo IP remoto.
 *
 * 4. RateLimitBuilder.AddRateLimiting(builder), chamado no BuilderConfig,
 *    executa esta configuração durante a criação da aplicação.
 *
 * 5. app.UseRateLimiter(), chamado no AppConfig depois de UseRouting,
 *    ativa o middleware que intercepta as requisições.
 *
 * 6. Cada endpoint protegido informa qual política deseja utilizar:
 *
 *    [EnableRateLimiting(RateLimitPolicies.Login)]
 *
 * 7. Ao receber uma requisição, o middleware encontra a política indicada,
 *    consulta o contador do IP e permite que o controller seja executado
 *    enquanto ainda houver permissões disponíveis dentro da janela.
 *
 * 8. Quando o limite é excedido, o controller não é executado. O OnRejected
 *    retorna HTTP 429, informa o tempo de espera no header Retry-After e
 *    registra somente o IP e a rota, sem incluir dados sensíveis da requisição.
 *
 * Resumo:
 * constante -> appsettings -> builder -> middleware -> atributo -> endpoint
 */
