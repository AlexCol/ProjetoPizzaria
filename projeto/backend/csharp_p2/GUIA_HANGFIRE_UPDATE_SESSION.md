# Guia prático: UpdateSessionAsync em segundo plano com Hangfire

Este guia mostra como aplicar Hangfire com DI no seu projeto para atualizar sessão em background, sem Task.Run e sem worker custom.

Tambem inclui um padrao que voce pode reaproveitar para outros processos, como envio de e-mail.

## 1. Objetivo

Trocar o fluxo atual de fila custom (IBackgroundJobQueue) por agendamento no Hangfire dentro do SessionService, mantendo:
- escopo de DI correto
- execucao em segundo plano
- retries automaticos
- reaproveitamento para novos jobs

## 2. Como o fluxo funciona

1. SessionService recebe userId e agenda um job no Hangfire.
2. O worker do Hangfire executa o metodo do job fora da requisicao HTTP.
3. O Hangfire resolve a classe do job via DI (Scoped/Transient etc.).
4. O job consulta usuario, monta payload, atualiza sessoes no cache e notifica SSE.

## 3. Pre-requisitos no projeto (ja existentes)

No seu projeto, isso ja esta configurado:
- Hangfire registrado em src/Config/Builder/Configs/HangfireBuilder.cs
- Hangfire dashboard e bootstrap em src/Config/App/Configs/HangfireApp.cs

Importante: hoje voce usa MemoryStorage, entao jobs nao sobrevivem restart da API.

## 4. Estrutura sugerida

Criar no modulo de sessao:

src/Modules/Session/
- ISessionUpdateJob.cs
- SessionUpdateJob.cs

## 5. Passo a passo

### 5.1 Criar interface do job

```csharp
namespace csharp_p2.src.Modules.Session;

public interface ISessionUpdateJob {
  Task ExecuteAsync(long userId);
}
```

### 5.2 Criar implementacao do job com DI

Use uma classe propria para o trabalho pesado.

```csharp
using csharp_p2.src.Config.Builder;
using csharp_p2.src.Modules.Domain;
using csharp_p2.src.Modules.Sse;

namespace csharp_p2.src.Modules.Session;

[Injectable(typeof(ISessionUpdateJob), EServiceLifetimeType.Scoped)]
public class SessionUpdateJob : ISessionUpdateJob {
  private readonly IGenericEntityRepository<User> _userRepository;
  private readonly ISessionService _sessionService;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly ISseService _sseService;

  public SessionUpdateJob(
    IGenericEntityRepository<User> userRepository,
    ISessionService sessionService,
    ISessionCacheService sessionCacheService,
    ISseService sseService
  ) {
    _userRepository = userRepository;
    _sessionService = sessionService;
    _sessionCacheService = sessionCacheService;
    _sseService = sseService;
  }

  public async Task ExecuteAsync(long userId) {
    var user = await _userRepository.GetByIdWithReferencesAsync(userId);
    if (user is null) return;

    var payload = await _sessionService.MontarPayloadAsync(user);

    await _sessionCacheService.UpdateSessionsByUserIdAsync(userId, payload);

    await _sseService.SendToUserAsync(userId.ToString(), ESseEvents.SessionUpdated, null);
  }
}
```

Observacao:
- O job recebe apenas userId (dado simples e serializavel).
- Evite passar entidade completa para o Hangfire.

### 5.3 Agendar job no SessionService

No SessionService, injete IBackgroundJobClient (Hangfire) e agende o job.

```csharp
using Hangfire;

public class SessionService : ISessionService {
  private readonly IBackgroundJobClient _backgroundJobClient;
  private readonly ISessionCacheService _sessionCacheService;
  private readonly IServiceProvider _serviceProvider;

  public SessionService(
    IBackgroundJobClient backgroundJobClient,
    ISessionCacheService sessionCacheService,
    IServiceProvider serviceProvider
  ) {
    _backgroundJobClient = backgroundJobClient;
    _sessionCacheService = sessionCacheService;
    _serviceProvider = serviceProvider;
  }

  public Task UpdateSessionAsync(long userId) {
    _backgroundJobClient.Enqueue<ISessionUpdateJob>(job => job.ExecuteAsync(userId));
    return Task.CompletedTask;
  }
}
```

Com isso, voce remove o uso de IBackgroundJobQueue para esse caso.

### 5.4 Limpar dependencias nao usadas

Depois da mudanca:
- remover import de csharp_p2.src.Modules.Infra.Background em SessionService (se nao usar mais)
- remover injeções/fields nao usados (_scopeFactory, por exemplo)
- manter classe enxuta

## 6. Boas praticas

- Regra de ouro: metodo de job deve ser pequeno e deterministico.
- Passe IDs no enqueue; busque dados no inicio do job.
- Capture excecoes com contexto (userId) para facilitar troubleshooting.
- Defina retries com cuidado para evitar efeitos duplicados.
- Se o job fizer I/O externo (email/API), pense em idempotencia.

## 7. Reuso para outros cenarios (e-mail)

Para email em background, repita o mesmo padrao:

1. Criar IEmailSendJob
2. Criar EmailSendJob com DI
3. Agendar com _backgroundJobClient.Enqueue<IEmailSendJob>(...)

Exemplo resumido:

```csharp
_backgroundJobClient.Enqueue<IEmailSendJob>(job =>
  job.ExecuteAsync(to, subject, body));
```

Se payload for grande, prefira passar um id e reidratar no job.

## 8. Quando manter worker custom em vez de Hangfire

Use worker custom quando:
- voce quer fila ultra simples em memoria
- nao precisa dashboard
- nao precisa persistencia

Use Hangfire quando:
- quer retries nativos e observabilidade
- quer padrao unico para varios jobs
- quer escalar para recorrentes/agendados

No seu cenario, Hangfire tende a ser mais simples para implementar e manter.

## 9. Checklist de validacao

- SessionService agenda job e retorna rapido.
- Job aparece no dashboard /hangfire.
- Job executa e atualiza sessao no cache.
- Evento SSE de SessionUpdated chega no cliente.
- Logs mostram sucesso/erro por userId.

## 10. Limite atual importante

Com MemoryStorage atual:
- restart da API limpa jobs pendentes.

Para producao, migre para storage persistente (SQL Server, Postgres, Redis etc.).