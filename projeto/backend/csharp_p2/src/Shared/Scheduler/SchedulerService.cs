using csharp_p2.src.Modules.Domain;
using Hangfire;

namespace csharp_p2.src.Shared.Scheduler;

public static class SchedulerService {
  public static void AddJobs() {
    // Job recorrente - todo dia à 1h da manhã
    RecurringJob.AddOrUpdate<ITokenControlService>(
      "ClearExpiredTokensDaily",
      service => service.ClearExpiredTokensAsync(),
      Cron.Daily(1));

    // Job único - executa 1 vez, 5 min após a aplicação iniciar
    BackgroundJob.Schedule<ITokenControlService>(
      service => service.ClearExpiredTokensAsync(),
      TimeSpan.FromMinutes(5));
  }
}
