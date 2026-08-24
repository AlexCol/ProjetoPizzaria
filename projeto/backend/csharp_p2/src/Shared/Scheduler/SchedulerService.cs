using csharp_p2.src.Modules.Domain;
using Hangfire;

namespace csharp_p2.src.Shared.Scheduler;

public static class SchedulerService {
  public static void AddJobs(
    IRecurringJobManager recurringJobManager,
    IBackgroundJobClient backgroundJobClient
  ) {
    // Job recorrente - todo dia à 1h da manhã
    recurringJobManager.AddOrUpdate<ITokenControlService>(
      "ClearExpiredTokensDaily",
      service => service.ClearExpiredTokensAsync(),
      Cron.Daily(1));

    // Job único - executa 1 vez, 1 min após a aplicação iniciar
    backgroundJobClient.Schedule<ITokenControlService>(
      service => service.ClearExpiredTokensAsync(),
      TimeSpan.FromMinutes(1));
  }
}

#region Resumo de uso do Hangfire
/*
Exemplos de criação de jobs durante a execução do sistema.

1. JOB ÚNICO (fire-and-forget)
  O job é enfileirado para uma única execução e será processado por um worker
  disponível do Hangfire.

    1.1. Usando IBackgroundJobClient obtido pelo DI:
      ? var backgroundJobClient = _serviceProvider.GetRequiredService<IBackgroundJobClient>();
      ? backgroundJobClient.Enqueue<IUsersEmailJob>(job => job.SendActivationEmailAsync(userId));

    1.2. Usando BackgroundJob diretamente:
      ? BackgroundJob.Enqueue<IUsersEmailJob>(job => job.SendActivationEmailAsync(userId));

2. JOB ÚNICO AGENDADO
  O job é criado para uma única execução futura. O tempo informado é contado
  a partir do momento em que o Schedule é executado.

  ? BackgroundJob.Schedule<IUsersEmailJob>(job => job.SendActivationEmailAsync(userId),TimeSpan.FromMinutes(5));

3. JOB RECORRENTE
  O job fica registrado no Hangfire e é enfileirado novamente conforme a
  expressão Cron configurada.

  3.1. Usando IRecurringJobManager obtido pelo DI:
    ? var recurringJobManager = _serviceProvider.GetRequiredService<IRecurringJobManager>();
    ? recurringJobManager.AddOrUpdate<ITokenControlService>(
    ?   "ClearExpiredTokensDaily",
    ?   job => job.ClearExpiredTokensAsync(),
    ?   Cron.Daily(1)
    ? );

  3.2. Usando RecurringJob diretamente:
    ? RecurringJob.AddOrUpdate<ITokenControlService>(
    ?   "ClearExpiredTokensDaily",
    ?   job => job.ClearExpiredTokensAsync(),
    ?   Cron.Daily(1)
    ? );

4. IDENTIFICADOR DOS JOBS RECORRENTES
  O primeiro parâmetro de AddOrUpdate identifica o job recorrente.

  Se AddOrUpdate for chamado novamente com o mesmo identificador, o job
  existente será atualizado em vez de um novo job ser criado.

  Ex.:
    ? RecurringJob.AddOrUpdate<IUsersEmailJob>(
    ?   $"SendActivationEmail-{userId}",
    ?   job => job.SendActivationEmailAsync(userId),
    ?   Cron.Daily(1)
    ? );

  Nesse exemplo, incluir userId no identificador permite manter um job
  recorrente diferente para cada usuário.

5. RESOLUÇÃO DOS SERVIÇOS
  O tipo informado ao Enqueue, Schedule ou AddOrUpdate pode ser uma interface
  ou classe resolvida pelo DI.

  O Hangfire não mantém a instância usada na expressão. Ele armazena as
  informações necessárias para executar o método e, quando um worker processa
  o job, resolve o serviço através do DI.

  Portanto, o serviço executado pelo job pode utilizar normalmente outras
  dependências registradas no container, como repositories, DbContext,
  ILogger, IHttpClientFactory, outros services, etc.

6. REMOÇÃO E CANCELAMENTO DE JOBS
  A forma de cancelar um job depende do seu estado e do tipo de agendamento.

  6.1. Remover um job recorrente:
    Remove a definição do job recorrente e impede que novas execuções sejam
    agendadas.

    Usando IRecurringJobManager:
      ? var recurringJobManager = _serviceProvider.GetRequiredService<IRecurringJobManager>();
      ? recurringJobManager.RemoveIfExists("ClearExpiredTokensDaily");

    Ou usando RecurringJob diretamente:
    ? RecurringJob.RemoveIfExists("ClearExpiredTokensDaily");

    O identificador deve ser o mesmo utilizado no AddOrUpdate.

    !IMPORTANTE:
    RemoveIfExists remove apenas o agendamento recorrente. Se uma execução desse
    job já tiver sido enfileirada ou estiver sendo executada, ela não será
    automaticamente cancelada.

  6.2. Remover um job único ou agendado:
    Enqueue e Schedule retornam o identificador do job criado.
      ? var jobId = BackgroundJob.Schedule<IUsersEmailJob>(
      ?   job => job.SendActivationEmailAsync(userId),
      ?   TimeSpan.FromMinutes(5)
      ? );

    Enquanto o job ainda não tiver sido concluído, pode-se solicitar sua
    remoção utilizando o identificador:
      ? BackgroundJob.Delete(jobId);

    O mesmo pode ser feito para jobs criados com Enqueue:
      ? var jobId = BackgroundJob.Enqueue<IUsersEmailJob>(
      ?   job => job.SendActivationEmailAsync(userId)
      ? );
      ? BackgroundJob.Delete(jobId);

    Por isso, caso exista a necessidade de permitir cancelamento posterior,
    pode ser útil armazenar o jobId relacionado à operação.

  6.3. Job que já está em execução:
    Remover o agendamento ou executar Delete não deve ser tratado como uma forma
    segura de interromper imediatamente código que já está executando.

    Para permitir cancelamento cooperativo durante a execução, o método do job
    pode receber um CancellationToken:

    ? public async Task SendActivationEmailAsync(long userId,CancellationToken cancellationToken) {
    ?   cancellationToken.ThrowIfCancellationRequested();
    ?   ...demais processos
    ? }

    ? BackgroundJob.Enqueue<IUsersEmailJob>(
    ?    job => job.SendActivationEmailAsync(userId, CancellationToken.None)
    ? );

    O CancellationToken não precisa ser serializado como argumento real do job;
    o Hangfire fornece o token apropriado durante a execução.

    O cancelamento é cooperativo: o código do job precisa observar o token,
    especialmente antes/depois de operações demoradas ou repassá-lo para APIs
    assíncronas que suportem CancellationToken.

  6.4. Desabilitar logicamente determinados jobs:
    Em alguns casos não basta remover um job específico. Por exemplo, pode ser
    necessário impedir temporariamente o envio de qualquer email de ativação.

    Nesse cenário, normalmente é melhor manter uma configuração/regra da
    aplicação e verificá-la dentro do próprio job:

    ? if (!config.SendActivationEmails) {
    ?   return;
    ? }

    Isso é diferente de remover jobs do Hangfire:

   * RemoveIfExists impede novas execuções de um recurring job específico;
   * Delete remove uma execução específica pelo jobId;
   * uma flag/configuração permite desabilitar uma categoria inteira de jobs,
   * inclusive jobs que já estavam previamente enfileirados.

  6.5. Resumo:
    ? RecurringJob.RemoveIfExists(id)
    ! -> remove o agendamento recorrente e impede futuras execuções.

    ? BackgroundJob.Delete(jobId)
    ! -> remove/cancela uma execução específica quando possível.

    ? CancellationToken
    ! -> permite que um job em execução encerre seu processamento de forma cooperativa.

    ? Configuração/flag própria
    ! -> permite habilitar ou desabilitar logicamente determinados tipos de job.

*/
#endregion

#region CancellationToken
/*

1. CANCELLATIONTOKEN NOS JOBS DO HANGFIRE
   Jobs que possuem processamento demorado podem receber um CancellationToken
   para permitir encerramento cooperativo.

   Ex.:
   ? public async Task SendActivationEmailAsync(
   ?   long userId,
   ?   CancellationToken cancellationToken
   ? ) {
   ?   cancellationToken.ThrowIfCancellationRequested();
   ?
   ?   await _emailService.SendActivationEmailAsync(
   ?     userId,
   ?     cancellationToken
   ?   );
   ? }

2. REGISTRO DO JOB COM CANCELLATIONTOKEN
   Ao criar o job, normalmente é informado CancellationToken.None:

   ? BackgroundJob.Enqueue<IUsersEmailJob>(
   ?   job => job.SendActivationEmailAsync(
   ?     userId,
   ?     CancellationToken.None
   ?   )
   ? );

   O CancellationToken.None informado aqui NÃO será o token efetivamente
   utilizado durante a execução do método.

   Ele funciona apenas como um valor necessário para montar a expressão que
   representa a chamada do job.

3. SUBSTITUIÇÃO DO TOKEN PELO HANGFIRE
   Quando o worker iniciar a execução do job, o Hangfire identifica parâmetros
   do tipo CancellationToken e substitui o valor informado na criação do job
   por um CancellationToken controlado pelo próprio Hangfire.

   Fluxo simplificado:

   ? BackgroundJob.Enqueue(
   ?   job => job.SendActivationEmailAsync(
   ?     userId,
   ?     CancellationToken.None
   ?   )
   ? );
   ?
   ! CancellationToken.None é apenas o placeholder usado na definição.
   !
   ! Quando o job for executado:
   !
   ! Hangfire Worker
   !   -> cria/obtém seu CancellationToken
   !   -> substitui o CancellationToken.None
   !   -> executa SendActivationEmailAsync(userId, hangfireCancellationToken)

   Portanto, dentro do método:

   ? cancellationToken.ThrowIfCancellationRequested();

   está verificando o CancellationToken fornecido pelo Hangfire durante a
   execução, e não o CancellationToken.None informado no Enqueue.

4. NÃO CRIAR CANCELLATIONTOKENS PRÓPRIOS PARA O JOB
   Não é necessário criar um CancellationTokenSource próprio para depois
   tentar cancelar o job.

   Ex. NÃO recomendado:

   ? var cancellationTokenSource = new CancellationTokenSource();
   ?
   ? BackgroundJob.Enqueue<IUsersEmailJob>(
   ?   job => job.SendActivationEmailAsync(
   ?     userId,
   ?     cancellationTokenSource.Token
   ?   )
   ? );

   Mesmo que seja informado outro CancellationToken, o Hangfire substitui o
   parâmetro CancellationToken pelo token utilizado na execução do job.

   Além disso, manter CancellationTokenSource em memória não funciona bem com
   a arquitetura do Hangfire, pois os jobs podem:

   * permanecer persistidos;
   * executar depois de reiniciar a aplicação;
   * executar em outro processo;
   * executar em outro servidor.

5. CANCELAMENTO COOPERATIVO
   O Hangfire não "mata" o código arbitrariamente. Ele sinaliza o
   CancellationToken e o próprio processamento precisa observar o cancelamento.

   Ex.:

   ? public async Task ProcessAsync(CancellationToken cancellationToken) {
   ?   foreach (var item in items) {
   ?     cancellationToken.ThrowIfCancellationRequested();
   ?
   ?     await ProcessItemAsync(
   ?       item,
   ?       cancellationToken
   ?     );
   ?   }
   ? }

   Sempre que possível, o token também deve ser repassado para operações
   assíncronas que suportem CancellationToken.

   Ex.:

   ? await dbContext.SaveChangesAsync(cancellationToken);
   ?
   ? await httpClient.SendAsync(
   ?   request,
   ?   cancellationToken
   ? );
   ?
   ? await Task.Delay(
   ?   TimeSpan.FromSeconds(10),
   ?   cancellationToken
   ? );

   Dessa forma, quando o Hangfire solicitar o cancelamento, essas operações
   também podem encerrar antecipadamente.

6. QUANDO O HANGFIRE SINALIZA O CANCELAMENTO
   Um dos principais casos é durante o encerramento gracioso do Hangfire Server.

   Quando o servidor Hangfire começa a ser encerrado:

   * deixa de buscar novos jobs;
   * sinaliza os CancellationTokens dos jobs que estão executando;
   * aguarda o encerramento cooperativo desses jobs;
   * os jobs pendentes continuam armazenados para processamento posterior.

   Portanto:

   ! parar o Hangfire Server
   !   -> impede novos jobs de iniciarem naquele servidor
   !   -> solicita cancelamento dos jobs atualmente em execução
   !   -> NÃO significa apagar os jobs existentes.

7. ADDHANGFIRESERVER E O CICLO DE VIDA DA APLICAÇÃO
   Quando utilizado:

   ? builder.Services.AddHangfireServer();

   o Hangfire Server é registrado como um serviço hospedado pelo ASP.NET Core.

   Nesse modelo, seu ciclo de vida fica vinculado ao ciclo de vida da aplicação.

   Assim, ao realizar um encerramento gracioso da aplicação:

   ? _applicationLifetime.StopApplication();

   o ASP.NET Core também encerra o Hangfire Server, que então sinaliza os
   CancellationTokens dos jobs atualmente em execução.

   Esse modelo é adequado quando Hangfire e aplicação devem iniciar e parar
   juntos.

8. PARAR SOMENTE O HANGFIRE
   Caso seja necessário manter a API funcionando e parar apenas o processamento
   de jobs, não é conveniente depender exclusivamente de:

   ? builder.Services.AddHangfireServer();

   Nesse cenário pode-se manter apenas a configuração:

   ? builder.Services.AddHangfire(config => {
   ?   config.UseMemoryStorage();
   ?
   ?   config.UseFilter(
   ?     new AutomaticRetryAttribute {
   ?       Attempts = 2
   ?     }
   ?   );
   ?
   ?   config.UseSimpleAssemblyNameTypeSerializer();
   ?   config.UseRecommendedSerializerSettings();
   ? });

   E controlar manualmente uma instância de BackgroundJobServer.

9. CONTROLE MANUAL DO BACKGROUNDJOBSERVER
   Exemplo de serviço responsável por iniciar e parar apenas os workers
   do Hangfire:

   ? public sealed class HangfireServerService : IDisposable {
   ?   private readonly object _lock = new();
   ?   private BackgroundJobServer? _server;
   ?
   ?   public bool IsRunning {
   ?     get {
   ?       lock (_lock) {
   ?         return _server is not null;
   ?       }
   ?     }
   ?   }
   ?
   ?   public void Start() {
   ?     lock (_lock) {
   ?       if (_server is not null) {
   ?         return;
   ?       }
   ?
   ?       _server = new BackgroundJobServer();
   ?     }
   ?   }
   ?
   ?   public void Stop() {
   ?     lock (_lock) {
   ?       if (_server is null) {
   ?         return;
   ?       }
   ?
   ?       _server.Dispose();
   ?       _server = null;
   ?     }
   ?   }
   ?
   ?   public void Dispose() {
   ?     Stop();
   ?   }
   ? }

   Registro no DI:

   ? builder.Services.AddSingleton<HangfireServerService>();

   Nesse modelo NÃO seria utilizado:

   ! builder.Services.AddHangfireServer();

   pois o BackgroundJobServer será controlado explicitamente pela aplicação.

10. INICIANDO O HANGFIRE MANUALMENTE
    Após criar a aplicação:

    ? var app = builder.Build();
    ?
    ? var hangfireServer =
    ?   app.Services.GetRequiredService<HangfireServerService>();
    ?
    ? hangfireServer.Start();

    A partir desse momento o Hangfire começa a consumir os jobs disponíveis.

11. PARANDO SOMENTE O HANGFIRE
    Quando for necessário impedir processamentos em background:

    ? var hangfireServer =
    ?   _serviceProvider.GetRequiredService<HangfireServerService>();
    ?
    ? hangfireServer.Stop();

    Isso mantém o ASP.NET Core em execução.

    Ex.:

    ! ASP.NET Core
    !   -> Controllers          CONTINUAM
    !   -> Endpoints HTTP      CONTINUAM
    !   -> DI                  CONTINUA
    !   -> Hangfire Dashboard  PODE CONTINUAR
    !   -> Hangfire Server     PARADO

12. O QUE ACONTECE COM OS JOBS AO PARAR O SERVIDOR
    Supondo:

    ! EXECUTANDO:
    !   #100 ImportData
    !   #101 GenerateReport
    !
    ! ENFILEIRADOS:
    !   #102 SendEmail
    !   #103 SendEmail
    !
    ! AGENDADO:
    !   #104 ClearTokens
    !
    ! RECORRENTE:
    !   ClearExpiredTokensDaily

    Ao executar:

    ? hangfireServer.Stop();

    os jobs em execução recebem solicitação de cancelamento através dos seus
    CancellationTokens.

    Os demais jobs NÃO precisam ser apagados.

    ! #100 / #101
    !   -> recebem solicitação de cancelamento
    !   -> devem encerrar cooperativamente
    !
    ! #102 / #103
    !   -> permanecem armazenados
    !
    ! #104
    !   -> permanece armazenado
    !
    ! ClearExpiredTokensDaily
    !   -> continua registrado

13. RETOMANDO O PROCESSAMENTO
    Após finalizar a operação que exigia a suspensão dos jobs:

    ? hangfireServer.Start();

    O novo BackgroundJobServer volta a consumir os jobs disponíveis.

    Portanto o fluxo pode ser:

    ! Hangfire executando
    !   -> Stop()
    !   -> jobs em execução recebem cancelamento
    !   -> processamento fica parado
    !   -> realiza atualização/manutenção
    !   -> Start()
    !   -> processamento continua

14. STOP NÃO IMPEDE NOVOS JOBS DE SEREM ENFILEIRADOS
    Parar o BackgroundJobServer interrompe os CONSUMIDORES dos jobs, mas não
    necessariamente os PRODUTORES.

    Mesmo com o servidor parado ainda pode ser executado:

    ? backgroundJobClient.Enqueue<IUsersEmailJob>(
    ?   job => job.SendActivationEmailAsync(
    ?     userId,
    ?     CancellationToken.None
    ?   )
    ? );

    O job será gravado no storage e ficará aguardando até existir novamente
    um Hangfire Server disponível.

    Portanto:

    ! Stop()
    !   -> para processamento dos jobs;
    !   -> não significa bloquear Enqueue/Schedule/AddOrUpdate.

15. MODO DE MANUTENÇÃO
    Caso uma atualização exija que nenhum novo processamento seja criado,
    é necessário combinar a parada do Hangfire com uma regra da aplicação.

    Exemplo de fluxo:

    ! Ativa modo de manutenção
    !   -> aplicação deixa de aceitar operações que criam jobs
    !   -> HangfireServer.Stop()
    !   -> jobs executando recebem cancelamento
    !   -> aguarda encerramento
    !   -> executa atualização
    !   -> HangfireServer.Start()
    !   -> desativa modo de manutenção

    Dessa forma existe uma separação clara:

    ? MaintenanceMode
    ! -> controla se a aplicação pode PRODUZIR novos jobs.

    ? HangfireServer.Stop()
    ! -> controla se o Hangfire pode CONSUMIR/executar jobs.

16. DIFERENÇA ENTRE PARAR, CANCELAR E REMOVER
    São operações diferentes:

    ? HangfireServer.Stop()
    ! -> interrompe temporariamente o processamento naquele servidor;
    ! -> sinaliza cancelamento dos jobs em execução;
    ! -> mantém os jobs armazenados.

    ? BackgroundJob.Delete(jobId)
    ! -> remove/cancela uma execução específica quando possível.

    ? RecurringJob.RemoveIfExists(id)
    ! -> remove a definição recorrente e impede futuras execuções.

    ? CancellationToken
    ! -> permite encerramento cooperativo do código atualmente executando.

    ? MaintenanceMode / flag própria
    ! -> pode impedir a criação ou execução lógica de determinadas categorias
    !    de jobs.

17. RESUMO DO FLUXO PARA ATUALIZAÇÃO DO SISTEMA
    Para uma atualização que exige ausência de processamento em background,
    mas não exige necessariamente desligar a API:

    ! 1. Ativar modo de manutenção.
    ! 2. Bloquear operações que possam criar novos jobs.
    ! 3. Executar HangfireServer.Stop().
    ! 4. Jobs atualmente executando recebem CancellationToken cancelado.
    ! 5. Cada job encerra cooperativamente.
    ! 6. Stop() retorna após o encerramento do BackgroundJobServer.
    ! 7. Executar a atualização/manutenção necessária.
    ! 8. Executar HangfireServer.Start().
    ! 9. Jobs pendentes voltam a ser processados.
    ! 10. Desativar modo de manutenção.

    Esse modelo evita a necessidade de:

    * manter CancellationTokenSource global;
    * armazenar CancellationTokenSource por job;
    * apagar todos os jobs antes de uma atualização;
    * parar toda a aplicação apenas para interromper o Hangfire.
      */
#endregion
