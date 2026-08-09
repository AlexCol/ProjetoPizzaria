using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.HttpOverrides;

namespace csharp_p2.src.Config.Builder;

public static class ForwardedHeadersBuilder {
  public static void AddForwardedHeaders(WebApplicationBuilder builder, EnvConfig env) {
    var config = env.ForwardedHeaders;
    if (config.ForwardLimit <= 0) {
      throw new InvalidOperationException("FORWARDED_HEADERS_LIMIT must be greater than zero.");
    }

    var trustedProxies = config.TrustedProxies.Select(ParseProxyIp).ToArray();

    builder.Services.Configure<ForwardedHeadersOptions>(options => {
      options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
      options.ForwardLimit = config.ForwardLimit;

      foreach (var proxyIp in trustedProxies) {
        options.KnownProxies.Add(proxyIp);

        // Kestrel pode representar um IPv4 como IPv6 mapeado (::ffff:x.x.x.x).
        // Registrar as duas formas mantém a confiança restrita ao mesmo IP exato.
        if (proxyIp.AddressFamily == AddressFamily.InterNetwork) {
          options.KnownProxies.Add(proxyIp.MapToIPv6());
        }
      }
    });
  }

  private static IPAddress ParseProxyIp(string value) {
    if (IPAddress.TryParse(value, out var proxyIp)) {
      return proxyIp;
    }

    throw new InvalidOperationException($"TRUSTED_PROXIES contains an invalid IP address: '{value}'.");
  }
}

/*
 * FLUXO DOS FORWARDED HEADERS
 *
 * 1. Quando a aplicação está atrás de um proxy reverso, a conexão recebida pelo
 *    backend vem do proxy. Por isso, RemoteIpAddress contém inicialmente o IP
 *    do proxy, e não necessariamente o IP original do cliente.
 *
 * 2. O proxy pode informar os dados originais da requisição por meio dos headers:
 *
 *    - X-Forwarded-For: informa o IP original do cliente e, em cenários com
 *      múltiplos proxies, pode conter uma cadeia de endereços;
 *
 *    - X-Forwarded-Proto: informa o protocolo original da requisição,
 *      normalmente HTTP ou HTTPS.
 *
 *    O proxy ou equipamento de rede precisa estar configurado para adicionar
 *    esses headers; eles não são necessariamente incluídos automaticamente
 *    por toda infraestrutura de proxy.
 *
 *    Esses headers não precisam ser adicionados ao AllowedHeaders do CORS.
 *    AllowedHeaders controla quais headers o código executado no navegador pode
 *    solicitar no preflight CORS. Já os forwarded headers são acrescentados
 *    pela infraestrutura de proxy depois que a requisição sai do navegador e
 *    são validados pelo middleware por meio de KnownProxies/KnownNetworks.
 *
 *    Além disso, o JavaScript executado no navegador não pode simplesmente
 *    definir X-Forwarded-For para escolher o IP que será considerado pelo
 *    backend.
 *
 * 3. EnvConfig lê as configurações do ambiente:
 *
 *    - TRUSTED_PROXIES: IPs exatos dos proxies autorizados a fornecer forwarded
 *      headers;
 *
 *    - FORWARDED_HEADERS_LIMIT: quantidade máxima de entradas dos forwarded
 *      headers que será processada, limitando quantos hops da cadeia de proxies
 *      serão considerados.
 *
 * 4. AddForwardedHeaders registra essas opções nos serviços do ASP.NET Core.
 *    Cada IP informado em TRUSTED_PROXIES é validado durante a inicialização
 *    e adicionado a KnownProxies.
 *
 *    Endereços IPv4 também são registrados no formato IPv6 mapeado, pois o
 *    endereço remoto pode ser representado como:
 *
 *    ::ffff:x.x.x.x
 *
 *    Dessa forma, a aplicação continua confiando somente no mesmo IP exato,
 *    independentemente da representação utilizada.
 *
 * 5. app.UseForwardedHeaders() ativa o middleware no início do pipeline,
 *    antes dos componentes que dependem do IP ou protocolo original, como
 *    logs e rate limiting.
 *
 *    Após processar os headers de um proxy confiável:
 *
 *    - X-Forwarded-For pode definir HttpContext.Connection.RemoteIpAddress;
 *
 *    - X-Forwarded-Proto pode definir HttpContext.Request.Scheme.
 *
 *    Assim, os componentes executados posteriormente passam a trabalhar com
 *    os valores processados pelo Forwarded Headers Middleware.
 *
 *    Por isso, o método GetClientIp do RateLimitBuilder não precisa ler
 *    X-Forwarded-For diretamente nem sofrer qualquer alteração.
 *
 *    Quando ele consulta HttpContext.Connection.RemoteIpAddress, o
 *    UseForwardedHeaders, executado anteriormente no pipeline, já processou
 *    X-Forwarded-For e definiu RemoteIpAddress com o valor correspondente.
 *
 *    Ler X-Forwarded-For diretamente dentro do rate limiter não é recomendado,
 *    pois ignoraria as regras de confiança e processamento aplicadas pelo
 *    Forwarded Headers Middleware e poderia permitir que valores não confiáveis
 *    fossem utilizados para identificar o cliente.
 *
 *    Portanto, a segurança desse fluxo depende também da ordem do pipeline:
 *
 *    app.UseForwardedHeaders();
 *    ...
 *    app.UseRateLimiter();
 *
 * 6. O middleware só processa forwarded headers quando o endereço remoto que
 *    está encaminhando a requisição é reconhecido como confiável por
 *    KnownProxies (ou KnownNetworks, caso também seja configurado).
 *
 *    Headers encaminhados por proxies não confiáveis são ignorados.
 *
 *    Essa restrição reduz o risco de um cliente falsificar X-Forwarded-For
 *    para alterar seu IP aparente, contornar o rate limiter ou adulterar logs.
 *
 * 7. Se TRUSTED_PROXIES estiver vazio, permanecem apenas os proxies locais
 *    considerados confiáveis pela configuração padrão do ASP.NET Core.
 *
 *    Em uma publicação atrás de um proxy reverso externo, load balancer ou
 *    infraestrutura semelhante, deve ser configurado o IP que o backend
 *    realmente enxerga como origem da conexão com esse proxy.
 *
 * Resumo:
 *
 * cliente
 *   -> proxy reverso adiciona X-Forwarded-For / X-Forwarded-Proto
 *   -> backend recebe inicialmente a conexão com o IP do proxy
 *   -> UseForwardedHeaders verifica se o proxy é confiável
 *   -> processa até ForwardLimit entradas dos forwarded headers
 *   -> define RemoteIpAddress e Request.Scheme com os valores processados
 *   -> logs e rate limiter utilizam esses valores
 */
