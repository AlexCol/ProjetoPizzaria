using System.Net;
using csharp_p2.src.Config;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace csharp_p2.src.Extensions;

public static class CorsBuilder {
  public static void AddCors(WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration);
    var frontendUrl = (env.FrondEnd.Url ?? string.Empty).Trim().TrimEnd('/');

    builder.Services.AddCors(opt => {
      opt.AddDefaultPolicy(build => {
        ApplyCorsPolicy(build, frontendUrl, false);
      });

      // Politica especifica para SSE (conexoes persistentes com autenticacao)
      opt.AddPolicy("SSEPolicy", build => {
        ApplyCorsPolicy(build, frontendUrl, true);
      });
    });
  }

  private static void ApplyCorsPolicy(CorsPolicyBuilder build, string frontendUrl, bool exposeSseHeaders) {
    build
      .SetIsOriginAllowed(origin => IsAllowedOrigin(origin, frontendUrl))
      .WithHeaders(AllowedHeaders)
      .WithMethods(AllowedMethods)
      .AllowCredentials();

    if (exposeSseHeaders) {
      build.WithExposedHeaders("Content-Type", "X-Custom-Header");
    }
  }

  private static bool IsAllowedOrigin(string origin, string frontendUrl) {
    //! Permite requests sem Origin e Origin "null" (ex.: file:// e alguns clientes não-browser).
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
