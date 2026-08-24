
using csharp_p2.src.Shared.Scheduler;
using Hangfire;
using Hangfire.Dashboard;

namespace csharp_p2.src.Config.App;

public static class HangfireApp {
  public static void UseHangfire(WebApplication app) {
    if (app.Environment.IsDevelopment()) { //
      var options = new DashboardOptions {
        Authorization = [new AllowAnonymousHangfireDashboard()]
      };
      app.MapHangfireDashboard("/hangfire", options).AllowAnonymous();

      Log.Information("📊 [Hangfire] Dashboard disponível em /hangfire");
    }

    // Resolve as APIs pelo container para garantir que o storage configurado por
    // AddHangfire esteja inicializado antes de registrar os jobs.
    var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
    var backgroundJobClient = app.Services.GetRequiredService<IBackgroundJobClient>();
    SchedulerService.AddJobs(recurringJobManager, backgroundJobClient);
  }

  private sealed class AllowAnonymousHangfireDashboard : IDashboardAuthorizationFilter {
    public bool Authorize(DashboardContext context) {
      return true;
    }
  }
}
