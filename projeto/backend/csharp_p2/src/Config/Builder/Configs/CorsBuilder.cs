using System.Net;
using csharp_p2.src.Config;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace csharp_p2.src.Extensions;

public static class CorsBuilder {
  public static void AddCors(WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration, builder.Environment);

    BuildValidations(env);

    builder.Services.AddCors(opt => {
      opt.AddDefaultPolicy(build => {
        ApplyCorsPolicy(build, env, false);
      });

      // Politica especifica para SSE (conexoes persistentes com autenticacao)
      opt.AddPolicy("SSEPolicy", build => {
        ApplyCorsPolicy(build, env, true);
      });
    });
  }

  private static void BuildValidations(EnvConfig env) {
    var frontendUrl = (env.FrondEnd.Url ?? string.Empty).Trim().TrimEnd('/');

    // validações validas para ambos ambientes (desenvolvimento e produção)
    var isValidUrl = Uri.TryCreate(frontendUrl, UriKind.Absolute, out var frontendUri);
    if (!isValidUrl) {
      throw new InvalidOperationException("FRONTEND_URL must be a valid absolute URL.");
    }

    var isHttp = frontendUri.Scheme == Uri.UriSchemeHttp;
    var isHttps = frontendUri.Scheme == Uri.UriSchemeHttps;
    if (!isHttp && !isHttps) {
      throw new InvalidOperationException("FRONTEND_URL must use HTTP or HTTPS.");
    }

    var configuredOrigin = frontendUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
    var containsOnlyOrigin = string.Equals(frontendUrl, configuredOrigin, StringComparison.OrdinalIgnoreCase);
    if (!containsOnlyOrigin) {
      throw new InvalidOperationException("FRONTEND_URL must contain only scheme, host and optional port.");
    }

    // validações validas apenas para produção
    if (env.IsDevelopment)
      return;

    if (frontendUri.Scheme != Uri.UriSchemeHttps) {
      throw new InvalidOperationException("FRONTEND_URL must use HTTPS in production.");
    }
  }

  private static void ApplyCorsPolicy(CorsPolicyBuilder build, EnvConfig env, bool exposeSseHeaders) {
    build
      .SetIsOriginAllowed(origin => IsAllowedOrigin(origin, env))
      .WithHeaders(AllowedHeaders)
      .WithMethods(AllowedMethods)
      .AllowCredentials();

    if (exposeSseHeaders) {
      build.WithExposedHeaders("Content-Type", "X-Custom-Header");
    }
  }

  private static bool IsAllowedOrigin(string origin, EnvConfig env) {
    var frontendUrl = (env.FrondEnd.Url ?? string.Empty).Trim().TrimEnd('/');
    var normalizedOrigin = origin.Trim().TrimEnd('/');

    if (env.IsDevelopment) {
      return IsAllowedOriginDevelopment(normalizedOrigin, frontendUrl);
    }

    return IsAllowedOriginProduction(normalizedOrigin, frontendUrl);
  }

  private static bool IsAllowedOriginProduction(string origin, string frontendUrl) {
    if (string.Equals(origin, frontendUrl, StringComparison.OrdinalIgnoreCase)) {
      return true;
    }

    return false;
  }

  private static bool IsAllowedOriginDevelopment(string origin, string frontendUrl) {
    //! Permite requests sem Origin e Origin "null" (ex.: file:// e alguns clientes não-browser).
    //! Decido manter mesmo não sendo recomendado, pois facilita desenvolvimento e testes de integração.
    if (string.IsNullOrWhiteSpace(origin) || origin == "null")
      return true;

    //! Normaliza para evitar diferença por espaços/barras no fim.
    var normalizedOrigin = origin.Trim().TrimEnd('/');

    //! Permite explicitamente a URL do frontend configurada em ambiente.
    if (!string.IsNullOrWhiteSpace(frontendUrl) && string.Equals(normalizedOrigin, frontendUrl, StringComparison.OrdinalIgnoreCase))
      return true;

    //! Origem precisa ser uma URI absoluta válida.
    if (!Uri.TryCreate(normalizedOrigin, UriKind.Absolute, out var uri))
      return false;

    //! Aceita apenas http/https.
    if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
      return false;

    //! Permite localhost para desenvolvimento.
    if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
      return true;

    //! Se nao for localhost, o host precisa ser um IP valido.
    if (!IPAddress.TryParse(uri.Host, out var ipAddress))
      return false;

    //! Permite loopback (127.0.0.1/::1).
    if (IPAddress.IsLoopback(ipAddress))
      return true;

    //! As faixas privadas abaixo sao IPv4.
    if (ipAddress.AddressFamily != System.Net.Sockets.AddressFamily.InterNetwork)
      return false;

    //! Permite apenas redes privadas locais (RFC1918).
    var bytes = ipAddress.GetAddressBytes();
    return bytes[0] == 10
      || (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31)
      || (bytes[0] == 192 && bytes[1] == 168);
  }

  private static string[] AllowedHeaders {
    get {
      string[] allowedHeaders = [
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Requested-With",
        "Accept-Language",
        "Accept-Encoding",
        "remember-me",
        "app-origin",
        //"Cache-Control", //deixando comentado pra ver se quebra (pra ver se realmente necessário)
      ];
      return allowedHeaders;
    }
  }

  private static string[] AllowedMethods {
    get {
      string[] allowedMethods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"];
      return allowedMethods;
    }
  }
}
