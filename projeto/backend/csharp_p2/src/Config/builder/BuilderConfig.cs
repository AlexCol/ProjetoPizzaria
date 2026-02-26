using csharp_p2.src.Config.builder.DI;
using csharp_p2.src.Extensions;
using csharp_p2.src.Infra.Database;

namespace csharp_p2.src.Config.builder;

public static class BuilderConfig {
  public static void AddConfigs(this WebApplicationBuilder builder) {
    //? logger temporário para capturar logs durante a inicialização, antes do Serilog ser configurado em AddLogService
    Log.Logger = new LoggerConfiguration()
      .ReadFrom.Configuration(builder.Configuration)
      .CreateBootstrapLogger();

    //!adicionando configurações padrão
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddControllers(options => {
      options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true; //* Remove a validação automática do ModelState (pra poder usar NotNull e não impedir o envio do json)
    });
    builder.Services.AddHttpContextAccessor();

    // Força o Kestrel a usar a configuração do appsettings.json
    builder.WebHost.UseKestrel(options => {
      options.Configure(builder.Configuration.GetSection("Kestrel"));
    });

    // Ignora qualquer variável de ambiente ASPNETCORE_URLS
    builder.WebHost.UseUrls(); // sem argumentos, ignora a variável

    // //!adicionando configurações
    SwaggerBuilder.AddSwagger(builder);
    DataBaseBuilder.AddDatabase(builder);
    CorsBuilder.AddCors(builder); //?lembrar depois de colocar useCors no app
    LogBuilder.AddLogService(builder);
    EmailBuilder.AddEmailService(builder);
    ZipBuilder.AddZip(builder);

    //!adicionando classes para injeções de dependencia
    DependencyInjectionBuilder.AddAutoInjectables(builder);
  }
}
