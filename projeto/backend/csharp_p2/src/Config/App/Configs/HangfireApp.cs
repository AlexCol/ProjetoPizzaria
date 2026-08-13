
using csharp_p2.src.Shared.Scheduler;
using Hangfire;

namespace csharp_p2.src.Config.App;

public static class HangfireApp {
  public static void UseHangfire(WebApplication app) {
    if (app.Environment.IsDevelopment()) {
      app.UseHangfireDashboard("/hangfire");
      Log.Information("📊 [Hangfire] Configurado e dashboard disponível em /hangfire");
    }

    //SchedulerService é meu serviço (não é do pacote), onde adiciono os jobs
    SchedulerService.AddJobs();
  }
}
