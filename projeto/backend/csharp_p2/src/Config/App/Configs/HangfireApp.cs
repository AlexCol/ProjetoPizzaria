
using csharp_p2.src.Shared.Scheduler;
using Hangfire;

namespace csharp_p2.src.Config.App;

public static class HangfireApp {
  public static void UseHangfire(WebApplication app) {
    app.UseHangfireDashboard("/hangfire");

    SchedulerService.AddJobs();

    Log.Information("📊 [Hangfire] Configurado e dashboard disponível em /hangfire");
  }
}
