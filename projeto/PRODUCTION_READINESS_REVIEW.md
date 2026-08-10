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

  Implementado: o nível base do Serilog agora é `Information`, aplicado em produção e nos demais ambientes não explicitamente sobrescritos. `appsettings.Development.json` redefine o nível para `Verbose`, preservando os detalhes durante o desenvolvimento. O log executado para cada requisição pelo `LogMiddleware` passou de `Information` para `Debug` e usa uma propriedade estruturada, ficando disponível em desenvolvimento sem gerar esse volume no ambiente publicado.

  Arquivos relacionados:

  - `backend/csharp_p2/appsettings.json`
  - `backend/csharp_p2/appsettings.Development.json`
  - `backend/csharp_p2/src/Shared/Middlewares/LogMiddleware.cs`

- [x] Revisar a conexão segura com o Redis de produção.

  Implementado no cliente: a conexão agora usa `ConfigurationOptions`, aplica corretamente `CACHE_DB`, aceita usuário ACL, exige TLS e senha fora de desenvolvimento, mantém a validação de certificado e revogação ativa, configura timeouts, tentativas iniciais, keep-alive e reconexão exponencial. O multiplexer continua singleton, recebe o `ILoggerFactory` para eventos de conexão e usa `BacklogPolicy.FailFast` para não acumular operações de sessão durante indisponibilidade. `AllowAdmin` permanece desabilitado.

  Requisito de infraestrutura documentado: no deploy, o Redis deve permanecer em rede privada/firewall, sem porta exposta à internet. Preferir um usuário ACL exclusivo com acesso apenas aos comandos e padrões de chave necessários pela aplicação e pelo handshake do StackExchange.Redis.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Infra/Cache/Builders/Redis/RedisCacheBuilder.cs`
  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`
  - `backend/csharp_p2/.env copy`

- [ ] Tornar a notificação SSE de sessão uma operação de melhor esforço.

  A redefinição da senha não deve falhar somente porque o job de notificação não pôde ser enfileirado. A revogação das sessões é a proteção efetiva; SSE apenas antecipa a atualização da interface. Revisar também a ordem entre commit, destruição das sessões e agendamento do job para deixar os resultados possíveis explícitos.

  Arquivos relacionados:

  - `backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs`
  - `backend/csharp_p2/src/Modules/Session/SessionService.cs`
  - `backend/csharp_p2/src/Modules/Session/SessionUpdateJob.cs`

- [ ] Revisar operações que percorrem todas as chaves de sessão no Redis.

  Atualização e destruição de sessões por usuário procuram chaves pelo prefixo global. Isso é aceitável com poucos usuários, mas o custo cresce com o total de sessões. Considerar manter um índice de tokens por usuário antes que o volume aumente.

  Arquivo relacionado:

  - `backend/csharp_p2/src/Modules/Session/SessionCacheService.cs`

- [ ] Validar configurações obrigatórias ao iniciar em produção.

  A aplicação não deve iniciar com origem do frontend, credenciais de banco/cache/e-mail ou segredos criptográficos vazios. A validação deve informar apenas o nome da configuração ausente, nunca seu conteúdo.

  Arquivo relacionado:

  - `backend/csharp_p2/src/Config/Env/EnvConfig.cs`

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

## Ordem sugerida de execução

1. Separar e restringir o CORS de produção.
2. Definir a estratégia de `SameSite` e antiforgery.
3. Expirar explicitamente tokens de ativação.
4. Armazenar hashes dos tokens de processo.
5. Configurar proxy confiável, HTTPS/HSTS e `AllowedHosts`.
6. Reduzir logs e impedir exposição de detalhes internos.
7. Validar configurações obrigatórias e segurança da conexão Redis.
8. Desacoplar a notificação SSE do sucesso da redefinição de senha.
9. Otimizar o índice de sessões quando o volume justificar.
