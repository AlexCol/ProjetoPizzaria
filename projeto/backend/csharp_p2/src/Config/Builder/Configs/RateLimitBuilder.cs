using System.Threading.RateLimiting;
using csharp_p2.src.Shared.DTOs;
using csharp_p2.src.Shared.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace csharp_p2.src.Config.Builder;

public static class RateLimitBuilder {
  public static void AddRateLimiting(WebApplicationBuilder builder, EnvConfig env) {
    var rateLimits = env.RateLimit;

    var defaultLimit = rateLimits.Default;
    var loginLimit = rateLimits.Login;
    var emailDeliveryLimit = rateLimits.EmailDelivery;
    var tokenOperationLimit = rateLimits.TokenOperation;

    builder.Services.AddRateLimiter(options => {
      options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

      options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>((context) => {
        var hasSpecificPolicy = context.GetEndpoint()?.Metadata
          .GetMetadata<EnableRateLimitingAttribute>() is not null;
        if (hasSpecificPolicy)
          return RateLimitPartition.GetNoLimiter("endpoint-specific-policy");
        return CreateFixedWindowPartition(context, defaultLimit);
      });

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
}

/*
 * FLUXO DO RATE LIMITING
 *
 * 1. RateLimitPolicies define constantes que identificam as políticas específicas:
 *    LOGIN, EMAIL_DELIVERY e TOKEN_OPERATION.
 *    Essas constantes são apenas identificadores; os limites e janelas vêm da configuração.
 *
 * 2. Este builder lê do appsettings.json as configurações de cada limitador:
 *    - PermitLimit: quantidade máxima de requisições permitidas na janela;
 *    - WindowSeconds: duração da janela em segundos.
 *
 *    Também existe uma configuração Default, usada pelo GlobalLimiter.
 *
 * 3. AddRateLimiter configura o Rate Limiting do ASP.NET Core:
 *    - GlobalLimiter: aplicado aos endpoints que NÃO possuem uma política específica;
 *    - LOGIN, EMAIL_DELIVERY e TOKEN_OPERATION: políticas específicas que podem ser
 *      associadas individualmente aos endpoints.
 *
 *    Todos os limitadores utilizam FixedWindow e são particionados pelo IP remoto,
 *    fazendo com que cada IP possua seu próprio contador.
 *
 * 4. Para evitar que o limite global e o limite específico sejam aplicados juntos,
 *    o GlobalLimiter verifica se o endpoint possui EnableRateLimitingAttribute.
 *    Caso possua, retorna um NoLimiter e deixa o controle exclusivamente para
 *    a política específica do endpoint.
 *
 * 5. RateLimitBuilder.AddRateLimiting(builder, env), chamado durante a configuração
 *    da aplicação, registra essas configurações nos serviços do ASP.NET Core.
 *
 * 6. app.UseRateLimiter(), registrado no pipeline da aplicação, ativa o middleware
 *    responsável por aplicar os limitadores às requisições.
 *
 * 7. Endpoints que precisam de um limite específico indicam a política através
 *    do atributo:
 *
 *    [EnableRateLimiting(RateLimitPolicies.LOGIN)]
 *
 *    Endpoints sem uma política específica continuam protegidos pelo GlobalLimiter,
 *    utilizando a configuração Default.
 *
 * 8. Ao receber uma requisição, o middleware identifica o limitador aplicável,
 *    obtém a partição correspondente ao IP e consome uma permissão da janela atual.
 *    Enquanto houver permissões disponíveis, a requisição segue para o endpoint.
 *
 * 9. Quando o limite é excedido, a requisição é rejeitada antes da execução
 *    do controller/endpoint. O OnRejected:
 *    - retorna HTTP 429 (Too Many Requests);
 *    - adiciona Retry-After quando essa informação estiver disponível no Lease;
 *    - retorna uma resposta JSON padronizada;
 *    - registra somente o IP e a rota da requisição.
 *
 * Resumo:
 *
 * appsettings
 *      ↓
 * RateLimitBuilder
 *      ↓
 * AddRateLimiter
 *      ↓
 * GlobalLimiter ou política específica
 *      ↓
 * particionamento por IP
 *      ↓
 * UseRateLimiter
 *      ↓
 * requisição permitida ou HTTP 429
 */
