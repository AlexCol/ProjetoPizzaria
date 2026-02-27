using csharp_p2.src.Config.App;
using csharp_p2.src.Config.builder;
using DotNetEnv;

CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("pt-BR");

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.AddConfigs();

var app = builder.Build();
app.AddConfigs();
app.Run();
