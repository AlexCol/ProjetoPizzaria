
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

    //SchedulerService é meu serviço (não é do pacote), onde adiciono os jobs
    SchedulerService.AddJobs();
  }

  private sealed class AllowAnonymousHangfireDashboard : IDashboardAuthorizationFilter {
    public bool Authorize(DashboardContext context) {
      return true;
    }
  }
}
