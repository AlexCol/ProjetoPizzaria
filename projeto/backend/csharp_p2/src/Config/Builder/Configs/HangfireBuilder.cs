using Hangfire;
using Hangfire.MemoryStorage;
using Hangfire.Redis.StackExchange;
using StackExchange.Redis;

namespace csharp_p2.src.Config.Builder;

public static class HangfireBuilder {
  public static void AddHangfire(WebApplicationBuilder builder, EnvConfig env) {
    builder.Services.AddHangfire((serviceProvider, config) => {
      //? configuração de onde os jobs são armazenados (Memory, Redis ou Valkey)
      ConfigureStorage(serviceProvider, config, env);

      //? Tenta reexecutar jobs que falharam automaticamente (máximo 2 tentativas)
      config.UseFilter(new AutomaticRetryAttribute { Attempts = 2 });

      // Mantém os nomes serializados menos dependentes da versão do assembly.
      //? Usa serialização simplificada de tipos (melhor compatibilidade entre versões)
      config.UseSimpleAssemblyNameTypeSerializer();
      //? Configurações recomendadas de serialização JSON (ignora loops, formata datas, etc)
      config.UseRecommendedSerializerSettings();
    });

    builder.Services.AddHangfireServer(options => {
      // options.WorkerCount = 5; // limita os workers que processam jobs em paralelo
    });
  }

  private static void ConfigureStorage(
    IServiceProvider serviceProvider,
    IGlobalConfiguration config,
    EnvConfig env
  ) {
    var storageType = env.Hangfire.StorageType;
    var storageEhMemory = storageType.Equals("Memory", StringComparison.OrdinalIgnoreCase);
    var storageEhRedis = storageType.Equals("Redis", StringComparison.OrdinalIgnoreCase);
    var storageEhValkey = storageType.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
    var storageEhDistribuido = storageEhRedis || storageEhValkey;

    if (storageEhMemory) {
      config.UseMemoryStorage();
      return;
    }

    if (storageEhDistribuido) {
      var multiplexer = serviceProvider.GetRequiredService<IConnectionMultiplexer>();
      config.UseRedisStorage(
        multiplexer,
        new RedisStorageOptions {
          Db = env.Hangfire.RedisDb,
          Prefix = env.Hangfire.RedisPrefix
        }
      );
      return;
    }

    throw new InvalidOperationException(
      $"Hangfire storage process for '{storageType}' was not configured."
    );
  }
}

/*
 * FLUXO DO STORAGE DO HANGFIRE
 *
 * 1. EnvConfig lê HANGFIRE_STORAGE_TYPE, HANGFIRE_REDIS_DB e
 *    HANGFIRE_REDIS_PREFIX. ValidadorEnvConfig impede Memory em produção e
 *    garante que Redis/Valkey só seja escolhido quando o CacheBuilder também
 *    registrar um IConnectionMultiplexer.
 *
 * 2. Memory mantém o comportamento simples para desenvolvimento, mas perde os
 *    jobs quando o processo é encerrado. Redis e Valkey seguem o mesmo ramo
 *    porque ambos expõem o protocolo RESP consumido por StackExchange.Redis.
 *
 * 3. O mesmo IConnectionMultiplexer singleton usado pelo cache e pelas sessões
 *    é reutilizado pelo Hangfire. Por isso, o Hangfire herda da conexão criada
 *    pelo CacheBuilder todas as configurações CACHE_*: host, porta, usuário ACL,
 *    senha, SSL/TLS, validação de certificado, timeouts, tentativas, keep-alive
 *    e políticas de reconexão e backlog. Isso também evita criar e manter uma
 *    segunda conexão física independente com o mesmo servidor.
 *
 * 4. As configurações HANGFIRE_* não criam outra conexão nem redefinem sua
 *    segurança. HANGFIRE_REDIS_DB apenas seleciona o banco lógico usado pelos
 *    jobs, enquanto HANGFIRE_REDIS_PREFIX cria um namespace exclusivo para suas
 *    chaves. O prefixo continua necessário mesmo com outro DB, pois evita colisões
 *    entre projetos. O usuário ACL definido em CACHE_USER precisa ter permissão
 *    para executar os comandos do cache e do Hangfire nos respectivos bancos.
 *
 * 5. A durabilidade depende também do servidor Valkey/Redis: o compose usa AOF,
 *    appendfsync everysec, volume persistente e maxmemory-policy=noeviction.
 *    Sem persistência no servidor, trocar o MemoryStorage não seria suficiente.
 *
 * 6. AddHangfireServer inicia os workers que buscam os jobs no storage. Após uma
 *    reinicialização da API, os jobs ainda pendentes permanecem no Valkey/Redis
 *    e voltam a ser processados assim que os workers forem iniciados e o job
 *    estiver elegível para execução.
 */
