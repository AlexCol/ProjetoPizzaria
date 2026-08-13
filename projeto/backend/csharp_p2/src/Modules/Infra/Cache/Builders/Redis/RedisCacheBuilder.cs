using csharp_p2.src.Config;
using Microsoft.Extensions.Caching;
using StackExchange.Redis;

namespace csharp_p2.src.Modules.Infra.Cache;

public static class RedisCacheBuilder {
  public static void AddRedisCache(this WebApplicationBuilder builder, EnvConfig env) {
    var configuration = BuildConfiguration(env);

    // Um único multiplexer deve ser compartilhado pela aplicação. Ele gerencia
    // as conexões físicas e tenta reconectar em segundo plano quando necessário.
    builder.Services.AddSingleton<IConnectionMultiplexer>(serviceProvider => {
      if (!env.IsDevelopment) { //log desabilitado em desenvolvimento pra não poluir o console
        configuration.LoggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();
      }
      return ConnectionMultiplexer.Connect(configuration);
    });

    builder.Services.AddSingleton<ICacheClient, RedisCacheClient>();
  }

  private static ConfigurationOptions BuildConfiguration(EnvConfig env) {
    var cache = env.Cache;
    var configuration = new ConfigurationOptions {
      User = string.IsNullOrWhiteSpace(cache.User) ? null : cache.User,
      Password = string.IsNullOrWhiteSpace(cache.Password) ? null : cache.Password,
      DefaultDatabase = cache.Db,
      Ssl = cache.Ssl,
      SslHost = cache.Ssl
        ? string.IsNullOrWhiteSpace(cache.SslHost) ? cache.Host : cache.SslHost
        : null,
      CheckCertificateRevocation = true,
      AbortOnConnectFail = false,
      AllowAdmin = false,
      ConnectTimeout = cache.ConnectTimeoutMillis,
      AsyncTimeout = cache.AsyncTimeoutMillis,
      SyncTimeout = cache.AsyncTimeoutMillis,
      ConnectRetry = cache.ConnectRetry,
      KeepAlive = cache.KeepAliveSeconds,
      ReconnectRetryPolicy = new ExponentialRetry(Math.Max(1000, cache.ConnectTimeoutMillis / 2)),
      BacklogPolicy = BacklogPolicy.FailFast
    };

    configuration.EndPoints.Add(cache.Host, cache.Port);
    return configuration;
  }

}

/*
 * FLUXO DA CONEXÃO SEGURA COM REDIS
 *
 * 1. EnvConfig lê host, porta, usuário ACL opcional, senha, database, TLS,
 *    timeouts, tentativas iniciais e keep-alive a partir das variáveis CACHE_*.
 *
 * 2. Fora de Development, a senha é obrigatória. TLS permanece configurável
 *    porque o Redis pode estar na mesma máquina e na rede Docker interna do
 *    Dokploy, sem publicar uma porta externa.
 *
 *    CACHE_SSL=false só é aceitável nesse cenário de rede interna confiável.
 *    Se a conexão atravessar a internet, outra máquina ou uma rede não confiável,
 *    CACHE_SSL deve ser true para não transmitir credenciais e dados em texto puro.
 *
 * 3. ConfigurationOptions mantém cada opção em uma propriedade própria. Isso
 *    evita montar manualmente uma connection string que contenha a senha.
 *
 * 4. Quando TLS está ativo, SslHost define o nome esperado no certificado.
 *    Se CACHE_SSL_HOST estiver vazio, CACHE_HOST é usado. A validação normal do
 *    certificado e a consulta de revogação permanecem ativas; não existe callback
 *    que aceite certificados inválidos.
 *
 * 5. ConnectTimeout e ConnectRetry limitam as tentativas da conexão inicial.
 *    AsyncTimeout limita as operações da aplicação. KeepAlive ajuda a detectar
 *    conexões ociosas interrompidas por rede, proxy ou serviço gerenciado.
 *
 * 6. AbortOnConnectFail=false permite criar o multiplexer mesmo se o Redis
 *    estiver temporariamente indisponível. O StackExchange.Redis continua
 *    tentando reconectar em segundo plano usando ExponentialRetry.
 *
 * 7. BacklogPolicy.FailFast evita acumular comandos durante uma queda. As
 *    operações falham enquanto o Redis está indisponível, em vez de serem
 *    executadas tardiamente depois da reconexão. Para sessões, esse comportamento
 *    é mais previsível e evita uma fila crescente dentro da aplicação.
 *
 * 8. AllowAdmin=false mantém desabilitados comandos administrativos perigosos.
 *    O usuário ACL configurado no servidor ainda precisa autorizar os comandos
 *    usados pela aplicação e pelo handshake do StackExchange.Redis.
 *
 * 9. IConnectionMultiplexer é singleton porque representa um gerenciador de
 *    conexões thread-safe e deve ser reutilizado. RedisCacheClient também usa
 *    essa mesma instância durante toda a vida da aplicação.
 *
 * 10. LoggerFactory registra eventos de conexão, desconexão, reconexão e erros
 *     do cliente, mas não habilita logging de cada comando nem registra a senha.
 *
 * 11. Esta configuração protege o cliente, mas o deploy ainda deve manter o
 *     Redis em rede privada/firewall, acessível somente pela API. Quando TLS
 *     estiver desabilitado, usar obrigatoriamente o host interno do Dokploy e
 *     não configurar External Port. A porta do Redis nunca deve ser exposta
 *     diretamente à internet.
 */
