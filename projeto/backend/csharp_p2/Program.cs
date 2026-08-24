using csharp_p2.src.Config.App;
using csharp_p2.src.Config.Builder;
using csharp_p2.src.Modules;
using DotNetEnv;

CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("pt-BR");

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.AddConfigs();

var app = builder.Build();
app.AddConfigs();

await using (var scope = app.Services.CreateAsyncScope()) {
  var appService = scope.ServiceProvider.GetRequiredService<IAppService>();

  app.Logger.LogInformation("Executando seeds...");
  await appService.RunSeedsAsync();
  app.Logger.LogInformation("Seeds executadas com sucesso.");
}

app.Run();
