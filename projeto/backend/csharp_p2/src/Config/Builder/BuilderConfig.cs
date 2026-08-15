using csharp_p2.src.Extensions;
using csharp_p2.src.Modules.Infra.Database;
using csharp_p2.src.Modules.Infra.Cache;
using csharp_p2.src.Modules.Infra.FileManager;

namespace csharp_p2.src.Config.Builder;

public static class BuilderConfig {
  public static void AddConfigs(this WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration, builder.Environment); //? 1
    builder.Services.AddSingleton(env); //? 1

    Log.Logger = new LoggerConfiguration()
      .ReadFrom.Configuration(builder.Configuration)
      .CreateBootstrapLogger(); //? 2

    AspnetBaseBuilder.AddBaseConfigs(builder); //? 3

    DependencyInjectionBuilder.AddAutoInjectables(builder); //? 4
    FileManagerBuilder.AddFileManager(builder, env); //? 5

    SwaggerBuilder.AddSwagger(builder); //? 6
    AuthBuilder.AddAuthentication(builder); //? 7
    DataBaseBuilder.AddDatabase(builder, env); //? 8
    CacheBuilder.AddCache(builder, env); //? 9
    DataProtectionBuilder.AddDataProtection(builder, env); //? 10
    HangfireBuilder.AddHangfire(builder, env); //? 11
    ForwardedHeadersBuilder.AddForwardedHeaders(builder, env); //? 12
    HttpsBuilder.AddHttps(builder); //? 13
    HostFilteringBuilder.AddHostFiltering(builder, env); //? 14
    CsrfBuilder.AddCsrf(builder, env); //? 15
    CorsBuilder.AddCors(builder, env); //? 16
    RateLimitBuilder.AddRateLimiting(builder, env); //? 17
    LogBuilder.AddLogService(builder); //? 18
    ZipBuilder.AddZip(builder); //? 19

    /*
     * ? 1. Cria o EnvConfig, valida as configurações de ambiente e registra
     *      manualmente a mesma instância como singleton. Os demais builders usam
     *      essa instância durante a montagem da aplicação, e serviços podem
     *      recebê-la posteriormente por injeção de dependência.
     *
     * ? 2. Cria o logger bootstrap do Serilog para registrar inclusive falhas que
     *      ocorram durante a inicialização. Depois, o item 18 integra o Serilog
     *      definitivamente ao host usando a configuração completa.
     *
     * ? 3. Registra a infraestrutura base do ASP.NET Core: controllers, API
     *      Explorer, binders, filtros, serialização JSON, HttpContextAccessor e
     *      Kestrel. Os controllers precisam ser mapeados por app.MapControllers()
     *      no AppConfig; o API Explorer também é usado pelo item 6.
     *
     * ? 4. Procura e registra automaticamente services, repositories, jobs e
     *      outras classes injetáveis do projeto, seguindo atributos, tipos
     *      genéricos e convenções. Esses registros são consumidos por controllers,
     *      middlewares e jobs durante a execução da aplicação.
     *
     * ? 5. Escolhe e registra o IFileManager correspondente ao ambiente, como
     *      LocalFileManager ou CloudinaryFileManager. Os serviços que manipulam
     *      arquivos recebem essa abstração por injeção de dependência.
     *
     * ? 6. Registra a geração do documento OpenAPI e seus transformers de enums,
     *      paginação e metadados. SwaggerApp.AddSwagger(app) mapeia o JSON/YAML
     *      e a interface Scalar, somente em Development.
     *
     * ? 7. Registra o esquema de autenticação de sessão, seu handler e a
     *      fallback policy que exige usuário autenticado por padrão. Requer
     *      app.UseAuthentication() e app.UseAuthorization() no AppConfig;
     *      endpoints públicos precisam ser marcados com AllowAnonymous.
     *
     * ? 8. Seleciona o provider configurado, registra o DbContext e a conexão
     *      com PostgreSQL ou Oracle. Repositories e serviços registrados no item
     *      4 usam esse DbContext por injeção de dependência.
     *
     * ? 9. Registra o cache em memória ou o cliente Redis/Valkey. No modo
     *      distribuído também registra o IConnectionMultiplexer singleton,
     *      reutilizado pelas sessões, pelo Data Protection do item 10 e pelo
     *      storage do Hangfire do item 11.
     *
     * ? 10. Registra o ASP.NET Core Data Protection, define o ApplicationName e,
     *       com Redis/Valkey, persiste o key ring usando o multiplexer do item 9.
     *       O antiforgery do item 15 utiliza esse serviço automaticamente para
     *       proteger e validar tokens CSRF.
     *
     * ? 11. Registra o Hangfire, configura seu storage, serialização, retries e
     *       inicia os workers do servidor. Com Redis/Valkey, depende do multiplexer
     *       do item 9. HangfireApp.UseHangfire(app) mapeia o dashboard em
     *       Development e registra os jobs recorrentes no SchedulerService.
     *
     * ? 12. Configura quais proxies podem fornecer X-Forwarded-For e
     *       X-Forwarded-Proto. Requer app.UseForwardedHeaders() no início do
     *       pipeline, antes de logs, HTTPS e rate limiting, que consomem o IP e o
     *       protocolo já processados.
     *
     * ? 13. Configura o redirecionamento HTTPS e a política HSTS. Fora de
     *       Development, o AppConfig ativa app.UseHsts() e
     *       app.UseHttpsRedirection(); atrás de proxy, depende do item 12 para
     *       reconhecer corretamente o protocolo original.
     *
     * ? 14. Preenche a chave convencional AllowedHosts consumida automaticamente
     *       pelo Host Filtering do ASP.NET Core. Não exige uma chamada Use no
     *       AppConfig; em Development aceita qualquer Host não vazio.
     *
     * ? 15. Registra as opções de antiforgery, incluindo cookie e header CSRF.
     *       Usa o Data Protection do item 10. A validação das requisições
     *       mutáveis é executada pelo CsrfProtectionMiddleware no AppConfig, e
     *       o AuthController usa IAntiforgery para emitir o par de tokens.
     *
     * ? 16. Registra as políticas CORS padrão e de SSE, com origens, headers,
     *       métodos e credenciais permitidos. CorsApp.AddCors(app) ativa
     *       app.UseCors() depois de UseRouting e antes de autenticação e
     *       autorização.
     *
     * ? 17. Registra o rate limiter global e as políticas específicas usadas
     *       pelo atributo EnableRateLimiting. Requer app.UseRateLimiter() no
     *       AppConfig e utiliza o IP processado anteriormente pelo item 12.
     *
     * ? 18. Integra o Serilog ao host com as configurações definitivas de logs.
     *       Substitui o logger bootstrap do item 2 e é utilizado tanto pelas
     *       chamadas estáticas Log quanto pelo pipeline de logging da aplicação.
     *
     * ? 19. Registra os providers Brotli e Gzip e suas opções de compressão de
     *       resposta. ZipApp.AddZip(app) ativa o middleware correspondente por
     *       meio de app.UseResponseCompression().
     */
  }
}
