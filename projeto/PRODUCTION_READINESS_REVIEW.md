# Revisão de preparação para produção

Revisão criada em 8 de agosto de 2026 para acompanhar os ajustes necessários antes de publicar o projeto em um ambiente acessível pela internet.

O escopo considera uma implantação com **uma única instância** do backend. Por decisão do projeto, testes automatizados não fazem parte deste checklist. Os itens já concluídos na revisão específica de autenticação permanecem documentados em `web/angular_p2/AUTH_FLOW_REVIEW.md`.

## Checklist de prioridade alta

- [x] Restringir o CORS de produção à origem configurada do frontend.

  Atualmente a mesma política também aceita `Origin: null`, `localhost`, endereços de loopback e redes IPv4 privadas. Essas permissões são úteis no desenvolvimento, mas não devem acompanhar o ambiente de produção.

  Ajuste esperado:

  - produção aceita somente a origem HTTPS configurada do frontend;
  - desenvolvimento pode manter as origens locais necessárias;
  - uma URL de frontend ausente ou inválida deve impedir a inicialização em produção;
  - credenciais continuam habilitadas somente para origens explicitamente permitidas.

  Arquivo relacionado:

  - `backend/csharp_p2/src/Config/Builder/Configs/CorsBuilder.cs`

  Implementado: o ambiente agora vem do `IHostEnvironment` oficial por meio do `EnvConfig`. A configuração valida `FRONTEND_URL` durante a inicialização, exige uma origem sem path, query ou fragmento e, fora de desenvolvimento, exige HTTPS e permite exclusivamente essa origem. Localhost, loopback, redes privadas e `Origin: null` permanecem restritos ao ramo de desenvolvimento; a aceitação de `Origin: null` foi mantida deliberadamente para facilitar testes locais.

- [x] Definir uma proteção explícita contra CSRF para a autenticação por cookie.

  O cookie de produção usa `SameSite=None` e acompanha requisições cross-site. CORS controla quais respostas o JavaScript pode acessar, mas não substitui integralmente uma proteção contra requisições forjadas, especialmente em endpoints autenticados sem corpo, como logout.

  Avaliar se frontend e API serão sempre *same-site*. Se forem, preferir `SameSite=Lax` quando compatível. Se `None` for realmente necessário, adicionar antiforgery com token enviado em um header próprio nas operações autenticadas que alteram estado.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Shared/Helpers/CookiesHandler.cs`
  - `backend/csharp_p2/src/Modules/Auth/Authentication/AuthController.cs`
  - `web/angular_p2/src/interceptors/api-base.interceptor.ts`

  Implementado: o backend utiliza o antiforgery nativo do ASP.NET Core com um cookie `HttpOnly` separado e um request token entregue pelo endpoint público `GET /api/auth/csrf-token`. Antes do login, o token é anônimo e permite proteger a própria criação da sessão; quando já existe um cookie de sessão válido, o handler autentica opcionalmente esse endpoint público e o token é emitido para a identidade atual. O Angular obtém o token durante a inicialização, guarda-o somente em memória, envia `X-CSRF-TOKEN` em `POST`, `PUT`, `PATCH` e `DELETE` e solicita um novo token autenticado depois do login. O middleware valida o login web e todas as operações mutáveis que utilizam `session_token`; clientes mobile que enviam `Authorization` permanecem fora do mecanismo por não dependerem de credenciais anexadas automaticamente pelo navegador. Em produção, o cookie antiforgery usa o prefixo `__Host-`, `Secure`, path `/` e `SameSite=None`. O header próprio foi incluído explicitamente no CORS.

  Fluxo:

  ```text
  inicialização
      -> GET público /auth/csrf-token
      -> Angular mantém o request token anônimo em memória
      -> POST /auth/login envia X-CSRF-TOKEN e cria a sessão
      -> GET /auth/csrf-token emite um novo token para o usuário autenticado
      -> operação mutável envia session_token + X-CSRF-TOKEN
      -> backend valida o par antes de executar a renovação da sessão e o endpoint
  ```

- [x] Adicionar expiração explícita ao token de ativação.

  O token de recuperação expira em dez minutos, mas o token de ativação é criado sem `ExpiresAt` e depende da rotina de limpeza de tokens antigos. Definir uma validade explícita, por exemplo 24 horas, e manter o reenvio invalidando tokens anteriores.

  Arquivo relacionado:

  - `backend/csharp_p2/src/Modules/Domain/Users/UsersEmailJob.cs`

  Implementado: cada token de ativação passa a ser criado com `ExpiresAt` de 24 horas em UTC. O serviço central de tokens já rejeita valores expirados, a rotina de limpeza os remove posteriormente e um novo reenvio continua invalidando tokens anteriores do mesmo usuário e processo.

- [x] Armazenar somente o hash dos tokens de ativação e recuperação.

  Os tokens possuem boa entropia, mas atualmente o valor utilizável é salvo diretamente no banco. Em caso de leitura indevida da tabela, tokens ainda válidos poderiam ser usados. O valor original deve existir apenas no e-mail; o banco deve guardar um hash determinístico para consulta e comparação.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Domain/TokenControl/TokenControlService.cs`
  - `backend/csharp_p2/src/Modules/Domain/_Entities/TokenControl.cs`

  Implementado: `RegisterProcessTokenAsync` continua retornando o token aleatório original para composição do e-mail, mas persiste somente seu SHA-256 hexadecimal. `GetValidTokenAsync` calcula novamente o hash do valor recebido antes da consulta e mantém a finalidade do processo como parte da busca. Como o token aleatório e o hash SHA-256 possuem 64 caracteres hexadecimais, o formato atual da coluna permanece compatível. Tokens em texto puro criados antes desta alteração deixam de ser reconhecidos e devem ser removidos ou reenviados durante a publicação.

- [x] Configurar forwarded headers antes do rate limiter.

  O limitador usa `RemoteIpAddress`. Atrás de proxy reverso, sem forwarded headers configurados corretamente, todos os clientes podem compartilhar o IP do proxy e o mesmo limite. Aceitar os headers somente de proxies ou redes conhecidos para impedir falsificação do IP.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/App/AppConfig.cs`
  - `backend/csharp_p2/src/Config/Builder/Configs/RateLimitBuilder.cs`

  Implementado: o middleware processa somente `X-Forwarded-For` e `X-Forwarded-Proto`, executa antes dos logs e do rate limiter e mantém `ForwardLimit` igual a um por padrão. IPs adicionais precisam ser declarados explicitamente em `TRUSTED_PROXIES`; as listas de proxies confiáveis nunca são liberadas para aceitar qualquer origem. Sem proxy configurado, requisições diretas continuam usando `RemoteIpAddress`. No deploy atrás de proxy, preencher a variável com o IP observado pelo backend é uma etapa obrigatória da configuração do ambiente.

- [x] Garantir HTTPS e HSTS no ambiente publicado.

  Confirmar que o proxy ou o ASP.NET Core redireciona HTTP para HTTPS e envia HSTS. O cookie já recebe `Secure` em produção, mas a aplicação também precisa impedir o uso acidental de conexões inseguras.

  Implementado: fora de `Development`, a aplicação envia HSTS com `max-age` de 30 dias e redireciona HTTP temporariamente para HTTPS na porta pública 443. `UseForwardedHeaders` executa antes dessas decisões para reconhecer `X-Forwarded-Proto: https` enviado pelo proxy confiável e evitar loops. `includeSubDomains` e `preload` permanecem desabilitados até que seja possível garantir HTTPS permanente em todos os subdomínios. O proxy de produção ainda deve possuir um certificado válido, encaminhar `X-Forwarded-Proto` e, preferencialmente, também bloquear ou redirecionar HTTP na borda.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Builder/Configs/HttpsBuilder.cs`
  - `backend/csharp_p2/src/Config/App/AppConfig.cs`

- [x] Não devolver detalhes internos de exceções nas respostas públicas.

  Revisar pontos que concatenam `Exception.Message` em mensagens retornadas ao cliente. A resposta pública deve ser genérica, enquanto a exceção completa permanece somente nos logs com um identificador de correlação.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs`
  - `backend/csharp_p2/src/Shared/Middlewares/ExceptionHandlingMiddleware.cs`

  Implementado: somente mensagens deliberadamente lançadas como `CustomError` com status 4xx são apresentadas ao cliente. Exceções técnicas e qualquer resposta 5xx recebem a mensagem genérica `An unexpected error occurred. Please try again later.`, sem `Exception.Message` nem mensagens das exceções internas. A resposta contém o `TraceId` da requisição, e o mesmo identificador acompanha o log estruturado com a exceção completa nos erros internos. Os serviços deixaram de concatenar `ex.Message` em erros públicos; validações de arquivo e mensagens esperadas de autenticação/sessão passaram a usar explicitamente `CustomError`. No Angular, o tratamento padronizado acrescenta `Referência: {traceId}` à mensagem somente quando o status é 5xx, permitindo correlacionar o erro apresentado com o log sem poluir respostas esperadas de negócio.

  Formato esperado para um erro interno:

  ```json
  {
    "Message": [
      "An unexpected error occurred. Please try again later."
    ],
    "TraceId": "0HN..."
  }
  ```

## Checklist de configuração e operação

- [x] Restringir `AllowedHosts` no ambiente de produção.

  Implementado: em desenvolvimento, `AllowedHosts` permanece como `*` para aceitar localhost, IPs da rede local e nomes de máquina. Fora de desenvolvimento, `ALLOWED_HOSTS` deve informar explicitamente os hosts da API separados por vírgula; a inicialização falha se a lista estiver vazia ou contiver o curinga global `*`. O builder converte a lista para a chave convencional `AllowedHosts`, consumida automaticamente pelo `HostFilteringMiddleware` do ASP.NET Core.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Builder/Configs/HostFilteringBuilder.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/appsettings.Development.json`
  - `backend/csharp_p2/.env copy`

- [x] Reduzir o nível de logs em produção.

  Implementado: o nível base do Serilog permanece em `Information`, e cada ambiente pode sobrescrevê-lo. `appsettings.Development.json` mantém os detalhes necessários ao desenvolvimento. O novo `appsettings.Production.json` reduz os logs do framework para `Warning`, mantém Entity Framework em `Error`, grava no arquivo a partir de `Information` e envia ao console somente eventos a partir de `Warning`. O log executado para cada requisição pelo `LogMiddleware` permanece em `Debug`, portanto não gera esse volume no ambiente publicado.

  Arquivos relacionados:

  - `backend/csharp_p2/appsettings.json`
  - `backend/csharp_p2/appsettings.Development.json`
  - `backend/csharp_p2/appsettings.Production.json`
  - `backend/csharp_p2/src/Shared/Middlewares/LogMiddleware.cs`

- [x] Remover endpoints auxiliares da superfície pública de produção.

  Implementado: as rotas auxiliares `run-seeds`, `test-search`, `test-db` e `test-cache` não são mais compiladas como endpoints HTTP. O endpoint público restante em `AppController` é o health check. O código dos seeds continua disponível no serviço para execução controlada pelo processo de inicialização/deploy, sem uma rota anônima capaz de dispará-lo pela internet.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/AppController.cs`
  - `backend/csharp_p2/src/Modules/AppService.cs`

- [x] Transformar o health check em uma verificação das dependências essenciais.

  Implementado: `GET /api/health` informa separadamente o estado da API, do banco e do cache. A consulta ao banco executa uma operação compatível com o provider configurado, enquanto a verificação do cache realiza leitura e escrita com TTL curto. Caso banco ou cache lancem uma exceção, o middleware global produz uma resposta 5xx, permitindo que a infraestrutura considere a instância indisponível. Esse endpoint pode ser utilizado como readiness; a parte `Api` representa apenas que o processo e o pipeline HTTP estão respondendo.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/AppController.cs`
  - `backend/csharp_p2/src/Modules/AppService.cs`
  - `backend/csharp_p2/src/Shared/DTOs/HealthCheck/HealthCheck.cs`

- [x] Não publicar o dashboard do Hangfire.

  Implementado: o servidor de jobs e os agendamentos continuam ativos em todos os ambientes, mas o dashboard `/hangfire` é registrado somente em `Development`. Assim, a interface administrativa não integra a superfície HTTP publicada em produção.

  Arquivo relacionado:

  - `backend/csharp_p2/src/Config/App/Configs/HangfireApp.cs`

- [x] Persistir os jobs do Hangfire em produção.

  Implementado: o Hangfire aceita `Memory`, `Redis` ou `Valkey` por meio de `HANGFIRE_STORAGE_TYPE`. `Memory` continua disponível para desenvolvimento, mas é rejeitado pelo `ValidadorEnvConfig` em produção. Redis e Valkey usam o provider `Hangfire.Redis.StackExchange` e reutilizam o mesmo `IConnectionMultiplexer` singleton registrado pelo cache, mantendo o storage independente do banco relacional escolhido pela aplicação. `HANGFIRE_REDIS_DB` separa logicamente os jobs, enquanto `HANGFIRE_REDIS_PREFIX` cria um namespace exclusivo para suas chaves. O ambiente local foi configurado com DB `1` e prefixo `{pizzaria-hangfire}:`; após encerrar uma instância da API, recurring jobs, jobs agendados, estados e históricos permaneceram no Valkey. A persistência em disco é complementada pelo AOF, volume persistente e política `noeviction` do container.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Builder/Configs/HangfireBuilder.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfigModels.cs`
  - `backend/csharp_p2/src/Config/Env/ValidadorEnvConfig.cs`
  - `backend/csharp_p2/src/Shared/Scheduler/SchedulerService.cs`
  - `backend/csharp_p2/docker/valkey/docker-compose.yml`
  - `backend/csharp_p2/.env copy`

- [x] Atualizar a dependência vulnerável `Microsoft.OpenApi`.

  Durante o restore do provider de Hangfire, o NuGet reportou `Microsoft.OpenApi 2.0.0` com vulnerabilidade conhecida de gravidade alta (`GHSA-v5pm-xwqc-g5wc`). Após a atualização dos pacotes da infraestrutura de OpenAPI/Swagger, o restore passou a resolver `Microsoft.OpenApi 2.7.5`. A validação foi concluída com restore completo e build Release sem avisos ou erros.

  Arquivos relacionados:

  - `backend/csharp_p2/csharp_p2.csproj`
  - `backend/csharp_p2/obj/project.assets.json`

- [x] Persistir as chaves do ASP.NET Core Data Protection.

  O key ring agora é persistido no Redis/Valkey com o provider oficial `Microsoft.AspNetCore.DataProtection.StackExchangeRedis`. A configuração reutiliza o mesmo `IConnectionMultiplexer` singleton do cache, grava em `CACHE_DB` sob uma chave exclusiva e sem TTL, e define um `ApplicationName` estável. Em produção, a validação impede o uso de cache em memória para essa finalidade. Como o compose utiliza AOF, volume persistente e `noeviction`, o key ring sobrevive à recriação da API e pode ser compartilhado por outras instâncias no futuro.

  A validação prática chamou o endpoint de emissão do token CSRF com sucesso, confirmou a criação de `{pizzaria-data-protection}:keys` no Valkey e obteve TTL `-1`, indicando que a chave não expira. O build Release também foi concluído sem avisos ou erros.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Builder/Configs/DataProtectionBuilder.cs`
  - `backend/csharp_p2/src/Config/Builder/BuilderConfig.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfigModels.cs`
  - `backend/csharp_p2/src/Config/Env/ValidadorEnvConfig.cs`
  - `backend/csharp_p2/csharp_p2.csproj`
  - `backend/csharp_p2/.env copy`
  - `backend/csharp_p2/docker/valkey/docker-compose.yml`

- [x] Definir a proteção em repouso do key ring do Data Protection.

  Decisão consciente do projeto: o key ring não receberá uma camada adicional de criptografia por certificado X.509 neste momento. A infraestrutura privada foi aceita como limite de confiança: o Redis/Valkey deve permanecer em rede Docker privada, sem porta externa, protegido por autenticação e acessível somente pela API. O host, o volume AOF e seus backups também devem ter acesso restrito, pois podem conter o material criptográfico do Data Protection em texto legível.

  Essa decisão é adequada ao escopo atual de estudo e instância única, mas deve ser revista se o modelo de ameaças passar a incluir leitura indevida do disco, snapshots ou backups. Nesse caso, adicionar proteção explícita com certificado X.509 mantido como secret e preservar certificados antigos enquanto ainda existirem payloads protegidos por eles.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Builder/Configs/DataProtectionBuilder.cs`
  - `backend/csharp_p2/docker/valkey/docker-compose.yml`

- [x] Definir a política de TLS para a conexão com o banco de produção.

  Decisão consciente do projeto: a conexão entre a API e o banco permanecerá sem TLS enquanto ambos estiverem na mesma máquina e rede Docker privada do Dokploy. O banco não deve publicar sua porta na internet, e o acesso ao host, à rede Docker, aos volumes e aos backups deve permanecer restrito. Nesse cenário, a rede privada foi aceita como limite de confiança, seguindo a mesma decisão adotada para o Valkey/Redis.

  Um futuro acesso administrativo pelo DBeaver será tratado como um canal separado da conexão da API. A opção preferencial é usar um túnel SSH, mantendo a porta do banco fechada externamente; se necessário, ela pode ser vinculada somente ao loopback do servidor. Essa configuração pertence ao DBeaver, ao SSH e à infraestrutura do servidor e não altera a connection string nem os builders usados pela API.

  Somente se a própria API passar a alcançar o banco por outra máquina ou rede não confiável será necessário reabrir este item e configurar TLS no client da API — `SSL Mode` no PostgreSQL ou `TCPS`/validação do servidor no Oracle. Se futuramente o DBeaver for conectado diretamente ao banco, sem túnel, TLS deve ser configurado no servidor e no próprio DBeaver, mantendo essa política independente da conexão interna usada pela API.

  Não foi adicionada uma variável `DB_SSL`, pois ela sugeriria uma equivalência que não existe entre os providers e não teria efeito enquanto o servidor do banco também não estivesse configurado para TLS.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Infra/Database/Builders/Postgres/PostgresDBBuilder.cs`
  - `backend/csharp_p2/src/Modules/Infra/Database/Builders/Oracle/OracleDBBuilder.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/src/Config/Env/ValidadorEnvConfig.cs`

- [x] Revisar a conexão segura com Valkey/Redis em produção.

  Implementado no cliente: a conexão usa `StackExchange.Redis`, que se comunica pelo protocolo RESP tanto com Redis quanto com Valkey. `ConfigurationOptions` aplica corretamente `CACHE_DB`, aceita usuário ACL e exige senha fora de desenvolvimento. TLS permanece configurável: `CACHE_SSL=false` é aceito para Valkey/Redis na mesma máquina/rede interna do Dokploy, usando o host interno e sem `External Port`; conexões que atravessem outra máquina ou rede não confiável devem usar `CACHE_SSL=true`. Quando TLS está ativo, a validação de certificado e revogação permanece habilitada. Também foram configurados timeouts, tentativas iniciais, keep-alive e reconexão exponencial. O multiplexer continua singleton, recebe o `ILoggerFactory` para eventos de conexão e usa `BacklogPolicy.FailFast` para não acumular operações de sessão durante indisponibilidade. `AllowAdmin` permanece desabilitado.

  O compose local foi migrado para a imagem oficial `valkey/valkey`, com AOF, `appendfsync everysec`, volume persistente e política `noeviction`. No deploy, o Valkey deve permanecer em rede privada/firewall, sem porta exposta à internet. Preferir um usuário ACL exclusivo com acesso apenas aos comandos e padrões de chave necessários pela aplicação e pelo handshake do StackExchange.Redis.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Infra/Cache/Builders/Redis/RedisCacheBuilder.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/.env copy`

- [x] Tornar a notificação SSE de sessão uma operação de melhor esforço.

  Implementado: `SessionService.UpdateSessionAsync` segue o mesmo padrão dos métodos de envio de e-mail — tenta enfileirar `SessionUpdateJob`, registra `Error` se o enqueue falhar e retorna uma `Task` concluída sem propagar a exceção aos fluxos principais. Isso vale para todos os chamadores, incluindo atualizações de usuário e role. Na recuperação de senha, alteração da senha, consumo do token e revogação das sessões continuam obrigatórios; o job de atualização/SSE só é solicitado depois do commit, garantindo que nenhuma notificação seja disparada antes da confirmação da nova senha. Depois de enfileirado, falhas na execução são responsabilidade do Hangfire e não alteram a resposta já concluída. Como trade-off de melhor esforço, uma falha definitiva no enqueue pode deixar temporariamente payloads antigos em sessões existentes; o erro fica registrado para diagnóstico.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs`
  - `backend/csharp_p2/src/Modules/Session/SessionService.cs`
  - `backend/csharp_p2/src/Modules/Session/SessionUpdateJob.cs`

- [x] Revisar operações que percorrem todas as chaves de sessão no Redis.

  Implementado: cada sessão permanece em `session:{token}`, e seu token também é registrado no conjunto `session-index:user:{userId}`. Criação e renovação mantêm o índice e seu TTL; logout individual, revogação por usuário e limpeza de referências expiradas removem seus membros. `UpdateSessionsByUserIdAsync` e `DestroySessionsByUserIdAsync` agora consultam somente os tokens do usuário, eliminando o `SCAN session:*` dessas operações frequentes. O índice usa operações de conjunto nativas e atômicas do Redis, também implementadas no cache em memória. Operações cuja finalidade é global — relatório administrativo de sessões e destruição de todas as sessões — continuam percorrendo todas as chaves, pois precisam considerar todos os usuários. Durante a revisão, também foi corrigida a desserialização do relatório de sessões ativas, que tentava interpretar `UserSession` diretamente como `UserSessionPayload`.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Session/SessionCacheService.cs`
  - `backend/csharp_p2/src/Modules/Infra/Cache/ICacheClient.cs`
  - `backend/csharp_p2/src/Modules/Infra/Cache/Builders/Redis/RedisCacheClient.cs`
  - `backend/csharp_p2/src/Modules/Infra/Cache/Builders/Memory/MemoryClient.cs`

- [x] Validar configurações obrigatórias ao iniciar em produção.

  Implementado com responsabilidades separadas: `EnvConfig` monta cada grupo e chama imediatamente seu método no `ValidadorEnvConfig`; o validador possui uma regra específica por grupo e considera explicitamente se ela vale em todos os ambientes ou somente em produção. Os records foram movidos para `EnvConfigModels` e as conversões tipadas para `LeitorEnvConfig`. São validados frontend e hosts permitidos, usuário administrativo, banco, cache, SMTP, segredo criptográfico, file manager, rate limit e forwarded headers. As regras condicionais consideram o tipo selecionado — credenciais Redis somente quando `CACHE_TYPE=Redis` e credenciais Cloudinary somente quando `FILE_MANAGER_TYPE=Cloudinary`. Uma falha interrompe a inicialização indicando apenas a seção e os nomes das configurações ausentes ou inválidas, sem expor valores. `CryptoService` continua lendo `CRYPTO_SECRET` pela instância central de `EnvConfig`, eliminando a chave antiga e divergente `Cripto:Secret`.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfigModels.cs`
  - `backend/csharp_p2/src/Config/Env/LeitorEnvConfig.cs`
  - `backend/csharp_p2/src/Config/Env/ValidadorEnvConfig.cs`
  - `backend/csharp_p2/src/Shared/Services/Crypto/CryptoService.cs`
  - `backend/csharp_p2/.env copy`

## Decisões e pontos já verificados

- [x] Manter um arquivo de exemplo com a estrutura das variáveis de ambiente.

  O arquivo `backend/csharp_p2/.env copy` foi confirmado pelo responsável como um modelo sem dados sensíveis, usado para orientar outros desenvolvedores após o clone. Manter somente valores vazios ou fictícios. Como convenção, pode ser renomeado futuramente para `.env.example`.

- [x] Usar uma única instância do backend nesta etapa.

  Com uma instância, o rate limiter e o registro de conexões SSE em memória são coerentes com o cenário atual. Não é necessário implementar agora limitação distribuída ou Redis Pub/Sub.

  Se houver escalabilidade horizontal no futuro, reabrir obrigatoriamente estes pontos:

  - compartilhar os contadores de rate limiting;
  - distribuir eventos SSE por Redis Pub/Sub ou outro broker;
  - garantir que jobs executados em qualquer instância alcancem conexões mantidas nas demais.

- [x] Sessões são armazenadas no servidor e referenciadas por cookie `HttpOnly`.
- [x] Cookie recebe `Secure` em produção.
- [x] Login, envio de e-mails e operações de token possuem rate limiting.
- [x] Recuperação e reenvio não permitem enumeração direta de usuários.
- [x] Tokens são vinculados à finalidade e validados novamente no consumo.
- [x] Redefinição de senha encerra as sessões existentes.
- [x] Sessões inválidas fazem o backend expirar o cookie antigo.
- [x] O frontend não coloca novos tokens de ativação ou recuperação nos caminhos e query strings enviados ao servidor.
- [x] Aceitar que `ADMIN_PASSWORD` seja validada apenas como obrigatória.

  Decisão consciente do projeto: `ADMIN_PASSWORD` é utilizada somente para criar o administrador caso ele ainda não exista, deve ser fornecida já como hash BCrypt e não atualiza a senha de um administrador existente. Como a execução dos seeds não está exposta por endpoint público, validar estruturalmente o hash foi considerado desnecessário para este projeto. Uma configuração incorreta continua sendo responsabilidade de quem executar o processo de seed.

## Próximos itens

1. Executar um teste de fumaça no ambiente publicado, incluindo health, proxy, HTTPS, CORS, CSRF, login, logout, recuperação de senha e reinicialização do container.
