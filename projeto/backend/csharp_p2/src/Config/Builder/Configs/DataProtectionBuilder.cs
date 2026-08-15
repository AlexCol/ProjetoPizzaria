using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.DataProtection.StackExchangeRedis;
using StackExchange.Redis;

namespace csharp_p2.src.Config.Builder;

public static class DataProtectionBuilder {
  public static void AddDataProtection(WebApplicationBuilder builder, EnvConfig env) {
    builder.Services
      .AddDataProtection()
      .SetApplicationName(env.DataProtection.ApplicationName);

    var cacheEhRedis = env.Cache.Type.Equals("Redis", StringComparison.OrdinalIgnoreCase);
    var cacheEhValkey = env.Cache.Type.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
    var cacheEhDistribuido = cacheEhRedis || cacheEhValkey;

    // Com CACHE_TYPE=Memory, este builder não configura um repositório Redis.
    // Isso não torna o Data Protection necessariamente efêmero: o ASP.NET Core
    // utiliza sua descoberta padrão de armazenamento. Produção exige Redis ou
    // Valkey na validação do EnvConfig.
    if (!cacheEhDistribuido) return;

    // A configuração via Options permite resolver pelo DI o mesmo multiplexer
    // singleton criado pelo CacheBuilder, sem montar outro ServiceProvider nem
    // abrir uma segunda conexão com o Redis/Valkey.
    builder.Services
      .AddOptions<KeyManagementOptions>()
      .Configure<IConnectionMultiplexer>((options, multiplexer) => {
        options.XmlRepository = new RedisXmlRepository(
          () => multiplexer.GetDatabase(env.Cache.Db),
          env.DataProtection.RedisKey
        );
      });
  }
}

/*
 * FLUXO DA PERSISTÊNCIA DAS CHAVES DE DATA PROTECTION
 *
 * 1. O ASP.NET Core Data Protection mantém um key ring com as chaves mestras
 *    usadas por recursos como antiforgery. Não é salvo um registro para cada
 *    token CSRF; os tokens são protegidos e validados a partir desse key ring.
 *
 * 2. DATA_PROTECTION_APPLICATION_NAME define um identificador estável para a
 *    aplicação. Ele deve permanecer igual entre reinicializações e instâncias
 *    que precisem interpretar os mesmos payloads protegidos.
 *
 * 3. Comentar a chamada DataProtectionBuilder.AddDataProtection não desabilita
 *    o Data Protection. Outros componentes do framework, como AddAntiforgery,
 *    registram e consomem esses serviços automaticamente. Sem esta configuração
 *    explícita, o ASP.NET Core volta a escolher seu repositório padrão.
 *
 * 4. O repositório padrão não fica necessariamente apenas em memória. Em uma
 *    execução local no Windows, normalmente fica no perfil do usuário em:
 *
 *      %LOCALAPPDATA%\ASP.NET\DataProtection-Keys
 *
 *    Assim, parar e iniciar o processo com o mesmo usuário e diretório da
 *    aplicação normalmente reutiliza o key ring e continua reconhecendo os
 *    payloads anteriores. Sem SetApplicationName, o framework também utiliza um
 *    discriminador derivado da aplicação, que pode mudar se seu caminho mudar.
 *
 * 5. A perda ocorre quando o repositório é realmente efêmero, é apagado ou
 *    deixa de estar acessível. Um caso comum é salvar no filesystem interno de
 *    um container e depois recriá-lo sem volume: reiniciar apenas o processo ou
 *    o mesmo container pode preservar os arquivos, mas recriar o container pode
 *    descartá-los. Para testar a perda, seria necessário reutilizar o mesmo par
 *    cookie/header CSRF emitido antes; pedir outro token depois da reinicialização
 *    cria um par novo e não comprova que o anterior continuou válido.
 *
 * 6. Com Redis ou Valkey, RedisXmlRepository grava o key ring na chave definida
 *    em DATA_PROTECTION_REDIS_KEY, no banco CACHE_DB e sem TTL. O mesmo
 *    IConnectionMultiplexer reutiliza host, porta, usuário, senha, TLS, timeouts
 *    e políticas de reconexão configurados em CACHE_*.
 *
 * 7. A chave precisa sobreviver à reinicialização do servidor. Por isso, o
 *    Valkey/Redis deve usar persistência em disco, volume durável e uma política
 *    sem eviction. O compose do projeto usa AOF, volume e noeviction.
 *
 * 8. Se o key ring for apagado, tokens antiforgery e outros payloads protegidos
 *    anteriormente deixam de ser validados. Não se deve aplicar TTL, limpar essa
 *    chave junto com o cache comum ou reutilizá-la em outra aplicação. Isso não
 *    preserva as sessões da aplicação: com CACHE_TYPE=Memory, elas continuam
 *    sendo perdidas quando o processo é encerrado.
 *
 * 9. Persistir explicitamente o key ring desabilita a proteção automática das
 *    chaves em repouso. Em uma publicação real, o acesso ao Valkey, seus volumes
 *    e backups deve ser restrito; para proteção adicional, configurar um
 *    mecanismo explícito como certificado X.509.
 */
