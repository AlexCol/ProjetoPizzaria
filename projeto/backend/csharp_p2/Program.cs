using csharp_p2.src.Config.App;
using csharp_p2.src.Config.builder;

CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("pt-BR");

var builder = WebApplication.CreateBuilder(args);
builder.AddConfigs();

var app = builder.Build();
app.AddConfigs();
app.Run();
