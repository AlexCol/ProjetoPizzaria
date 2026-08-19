# Revisão dos fluxos de autenticação

Revisão realizada em 8 de agosto de 2026 sobre os fluxos de usuário não autenticado, login, recuperação de senha, reenvio do e-mail de ativação e ativação de conta.

O projeto tem uma boa base para estudo, principalmente pelo uso de sessão com cookie `HttpOnly`, inicialização da autenticação antes das rotas, separação dos guards e validação também no backend. Os itens abaixo estão organizados por prioridade para serem atacados um a um.

## Checklist de prioridade alta

- [x] Vincular cada token à sua finalidade correta.

  O backend procura o token somente pelo valor, sem verificar se ele pertence ao processo de ativação ou recuperação de senha.

  Arquivos relacionados:

  - `projeto/backend/csharp_p2/src/Modules/Domain/TokenControl/TokenControlService.cs:48`
  - `projeto/backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs:136`
  - `projeto/backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs:197`

  Implementado: a consulta agora exige `token + processo esperado`. Ativação usa `Processes.ActivateUser`; redefinição de senha e sua validação preliminar usam `Processes.PasswordReset`. A validade continua no item específico de expiração abaixo.

- [x] Impedir que tokens sensíveis apareçam nos logs.

  O Angular envia tokens como parte da URL, enquanto o backend registra o caminho completo da requisição. Isso expõe tokens de ativação e recuperação nos logs.

  Arquivos relacionados:

  - `src/services/users/users.service.ts:18`
  - `src/services/token-control/token-control.service.ts:13`
  - `projeto/backend/csharp_p2/src/Shared/Middlewares/LogMiddleware.cs:10`
  - `projeto/backend/csharp_p2/src/Shared/Middlewares/ExceptionHandlingMiddleware.cs:29`

  Implementado: ativação, recuperação de senha e validação preliminar agora enviam o token no corpo de requisições `POST`. Os novos links de e-mail usam `#token=...`, cujo fragmento não é enviado ao servidor, e o Angular remove o token da barra de endereço depois de capturá-lo. Links antigos com `?token=` continuam temporariamente compatíveis. Armazenar somente o hash do token no banco permanece como uma evolução futura de defesa em profundidade.

- [x] Corrigir o environment usado pelo bundle de produção.

  O interceptor importa diretamente `environment.development`, ignorando o `fileReplacements` do Angular. O bundle de produção foi confirmado com `http://localhost:3300/api` e `production: false`.

  Arquivo relacionado:

  - `src/interceptors/api-base.interceptor.ts:4`

  Implementado: interceptor HTTP, logger e serviço SSE agora importam o environment base, permitindo que o `fileReplacements` selecione a configuração de desenvolvimento. O bundle de produção foi confirmado com `production: true` e `https://api.meusite.com/api`, sem a URL de localhost.

- [x] Implementar limitação de tentativas no servidor.

  Não foi encontrado rate limiting para login, recuperação de senha, reenvio de ativação ou validação de token. O bloqueio temporário do botão no Angular é apenas uma conveniência visual e pode ser contornado chamando a API diretamente.

  Implementado com o rate limiter nativo do ASP.NET Core, particionado pelo IP remoto e sem fila de espera:

  - Login web/mobile: 5 requisições por minuto.
  - Recuperação e reenvio de e-mail: 3 requisições a cada 15 minutos.
  - Validação, consumo e ativação por token: 10 requisições por minuto.

  Os valores são configuráveis na seção `RateLimiting` do `appsettings.json`. Rejeições retornam HTTP `429`, cabeçalho `Retry-After`, resposta no padrão `ErrorResponseDto` e log sem dados sensíveis. Em um futuro deploy atrás de proxy reverso, os forwarded headers deverão ser configurados somente para proxies confiáveis antes do rate limiter. Em múltiplas instâncias, será necessário um limitador distribuído para compartilhar os contadores.

## Checklist de prioridade média

- [x] Corrigir os redirecionamentos para a rota de login.

  Após ativar a conta ou trocar a senha, os componentes navegam para `/login`, mas a rota correta é `/auth/login`. Atualmente o wildcard mascara o problema.

  Arquivos relacionados:

  - `src/app/pages/not-logged/activate-account/activate-account.ts:45`
  - `src/app/pages/not-logged/password-change/password-change.ts:101`

  Implementado: os redirecionamentos após ativação e redefinição de senha agora apontam explicitamente para `/auth/login`. Os redirects e links relativos existentes dentro do grupo `/auth` foram mantidos porque já resolvem para a mesma rota corretamente.

- [x] Tratar corretamente links sem token.

  As páginas usam `input.required<string>()` e depois tentam testar `if (!this.token())`. A leitura de um input obrigatório ausente pode falhar antes que a mensagem "Token inválido" seja apresentada.

  Arquivos relacionados:

  - `src/app/pages/not-logged/activate-account/activate-account.ts:25`
  - `src/app/pages/not-logged/password-change/password-change.ts:33`

  Implementado junto da migração dos tokens para fragmentos: os componentes não usam mais `input.required`, leem o token da rota de maneira segura e interrompem o fluxo antes de chamar a API quando ele não existe.

- [x] Fazer a validação preliminar verificar expiração e finalidade.

  O endpoint de validação verifica somente se o token existe. Um token expirado pode liberar o formulário e falhar apenas depois que a nova senha for enviada.

  Arquivo relacionado:

  - `projeto/backend/csharp_p2/src/Modules/Domain/TokenControl/TokenControlController.cs:14`

  Implementado: `GetValidTokenAsync` centraliza existência, finalidade e expiração no `TokenControlService`. A validação preliminar, a ativação e a redefinição de senha reutilizam esse método. Tokens sem expiração continuam válidos até serem consumidos ou removidos pela rotina de limpeza; tokens com `ExpiresAt` igual ou anterior ao horário atual são rejeitados. O consumo final continua validando novamente para cobrir expiração ou consumo ocorridos depois da abertura da tela.

- [x] Evitar enumeração de usuários na recuperação e no reenvio.

  O backend diferencia usuário inexistente, usuário inativo, usuário já ativo e sucesso. Isso permite descobrir quais e-mails estão cadastrados e o estado da conta.

  Arquivos relacionados:

  - `projeto/backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs:165`
  - `projeto/backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs:181`

  Implementado: para e-mails com formato válido, ambos os endpoints retornam sempre HTTP `200` com uma mensagem genérica, independentemente de a conta existir ou estar ativa, inativa ou bloqueada. O job de ativação é criado somente para contas inativas e o de recuperação somente para contas ativas. Falhas internas ao enfileirar o e-mail são registradas sem alterar a resposta pública; os limites de rate limiting continuam sendo aplicados.

- [x] Encerrar sessões existentes após redefinir a senha.

  A senha é atualizada, mas as sessões existentes do usuário não são destruídas. Isso mantém uma possível sessão comprometida ativa.

  Arquivo relacionado:

  - `projeto/backend/csharp_p2/src/Modules/Domain/Users/UsersService.cs:215`

  Implementado: após atualizar a senha e consumir o token, o backend remove todas as sessões do usuário antes de confirmar a transação. Se a limpeza do cache falhar, a alteração no banco é revertida; se o commit falhar depois de as sessões serem removidas, o usuário apenas precisará autenticar novamente.

- [x] Não esconder falhas do logout.

  Qualquer erro do endpoint de logout é convertido em sucesso e o estado local é limpo. Como o cookie é `HttpOnly`, o Angular não consegue removê-lo. Se o servidor não processar o logout, a sessão continuará ativa e poderá reaparecer após atualizar a página.

  Arquivo relacionado:

  - `src/services/auth/auth.service.ts:65`

  Implementado: o logout agora limpa o estado local e redireciona somente depois que o backend confirma o encerramento da sessão. Falhas permanecem no canal de erro e são apresentadas pelo `HeaderComponent`; assim, um erro de rede ou do servidor não é tratado como logout bem-sucedido nem deixa um cookie `HttpOnly` potencialmente válido escondido atrás de um estado local anônimo.

- [x] Rever o guard aplicado às rotas que consomem tokens.

  Todo o grupo `/auth` usa o `notLoggedGuard`. Um usuário autenticado que abrir um link de ativação ou recuperação será enviado para `/home` sem explicação.

  Arquivo relacionado:

  - `src/app/pages/not-logged/not-logged.routes.ts:9`

  Resolvido por decisão arquitetural: o `notLoggedGuard` foi mantido também nas rotas que consomem tokens. Assim, um usuário autenticado não consegue abrir um link pertencente a outra conta, concluir a operação e continuar vendo a sessão anterior, o que seria uma experiência confusa e poderia favorecer ações na conta errada. Para consumir um link de ativação ou redefinição, a sessão atual deve ser encerrada primeiro.

## Checklist de UX e qualidade

- [x] Criar página 404 compartilhada para os fluxos autenticado e não autenticado, com fallback global.
- [x] Exibir estado de carregamento enquanto tokens de recuperação e ativação são validados ou consumidos, mantendo o formulário oculto até a validação terminar.

  Implementado: as telas de ativação e redefinição iniciam com status `loading` e exibem o loader compartilhado. A redefinição só apresenta o formulário depois de a validação preliminar retornar sucesso; validação, ativação e envio da nova senha mantêm o conteúdo oculto enquanto a chamada está em andamento.

- [x] Ativar o estado `loading` e desabilitar o submit durante recuperação e reenvio.

  Implementado: as duas telas entram em `loading` antes de chamar a API, limpam mensagens anteriores, desabilitam o botão e exibem `Enviando...` durante a requisição. Os métodos também ignoram novos submits enquanto o envio está em andamento, cobrindo submissões pelo teclado além de cliques duplicados.

- [x] Trocar o texto do botão de reenvio de `Recuperar` para `Reenviar`.
- [x] Adicionar `Validators.minLength(8)` no formulário Angular de nova senha para refletir o backend.

  Implementado: o controle reativo da nova senha exige no mínimo oito caracteres, o input recebe o mesmo limite e o submit apresenta uma mensagem específica quando a regra não é atendida.

- [x] Cancelar os timers de redirecionamento quando os componentes forem destruídos.

  Implementado: ativação de conta e redefinição de senha guardam a referência do timer, cancelam um agendamento anterior antes de criar outro e o removem via `DestroyRef.onDestroy` quando o componente sai da tela.

- [x] Padronizar o tratamento de erro para nunca apresentar uma mensagem vazia.

  Implementado: `getApiErrorMessage` centraliza a leitura de mensagens simples ou em lista, aceita `Message` e `message`, remove espaços vazios e sempre usa um fallback seguro. As telas revisadas e `processaErros` reutilizam o helper.

- [x] Preservar a rota originalmente solicitada após o login, usando um `returnUrl` validado.

  Implementado: o `loggedGuard` adiciona ao login o caminho protegido solicitado. Após autenticar, o login aceita somente caminhos internos iniciados por `/`, rejeita `//`, rotas do próprio grupo `/auth` e URLs inválidas; na ausência de um destino seguro, usa `/home`.

- [ ] Adicionar testes para guards, serviço de autenticação e fluxos de token.

## Pontos positivos identificados

- [x] Sessão armazenada em cookie `HttpOnly`, e não em `localStorage`.
- [x] Cookie recebe `Secure` em produção.
- [x] Angular utiliza `withCredentials` consistentemente.
- [x] Sessão é restaurada antes da navegação inicial com `provideAppInitializer`.
- [x] Login usa mensagem genérica para usuário inexistente ou senha incorreta.
- [x] Guards retornam `UrlTree` em vez de realizar navegação imperativa.
- [x] Autorização por função também existe no backend.
- [x] Tokens são gerados com `RandomNumberGenerator` e possuem boa entropia.
- [x] Tokens são invalidados após o uso.
- [x] A geração de um novo token invalida tokens anteriores do mesmo processo.
- [x] Token de recuperação de senha possui expiração de dez minutos.
- [x] Senha é validada no Angular e no backend.
- [x] Componentes utilizam `takeUntilDestroyed` nas assinaturas observables.
- [x] Build do Angular concluído com sucesso.
- [x] Lint concluído sem erros; existem apenas dois avisos fora dos fluxos revisados.

## Ordem sugerida de execução

1. Corrigir finalidade e validade dos tokens.
2. Remover tokens de URLs registradas em logs.
3. Corrigir o import do environment de produção.
4. Implementar rate limiting.
5. Invalidar sessões depois da redefinição de senha.
6. Corrigir rotas, inputs de token e validação preliminar.
7. Uniformizar respostas públicas contra enumeração.
8. Refinar logout, estados de carregamento e mensagens.
9. Criar testes automatizados para os fluxos.
