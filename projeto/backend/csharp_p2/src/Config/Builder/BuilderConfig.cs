using csharp_p2.src.Extensions;
using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Modules.Infra.Cache;
using csharp_p2.src.Modules.Infra.FileManager;

namespace csharp_p2.src.Config.Builder;

public static class BuilderConfig {
  public static void AddConfigs(this WebApplicationBuilder builder) {
    //? Configurações de ambiente
    var env = new EnvConfig(builder.Configuration, builder.Environment);
    builder.Services.AddSingleton(env); //feito manual, pra manter a mesma instancia em toda a aplicação, e não criar uma nova a cada injeção

    //? logger temporário para capturar logs durante a inicialização, antes do Serilog ser configurado em AddLogService
    Log.Logger = new LoggerConfiguration()
      .ReadFrom.Configuration(builder.Configuration)
      .CreateBootstrapLogger();

    //! Configurações base do ASP.NET (Controllers, JsonOptions, Kestrel, etc)
    AspnetBaseBuilder.AddBaseConfigs(builder);

    //!adicionando classes para injeções de dependencia
    DependencyInjectionBuilder.AddAutoInjectables(builder);
    FileManagerBuilder.AddFileManager(builder, env);

    // //!adicionando configurações
    SwaggerBuilder.AddSwagger(builder);
    AuthBuilder.AddAuthentication(builder);
    DataBaseBuilder.AddDatabase(builder, env);
    CacheBuilder.AddCache(builder, env);
    HangfireBuilder.AddHangfire(builder);
    CorsBuilder.AddCors(builder, env); //?lembrar depois de colocar useCors no app
    RateLimitBuilder.AddRateLimiting(builder, env);
    LogBuilder.AddLogService(builder);
    ZipBuilder.AddZip(builder);
  }
}
