using csharp_p2.src.Shared.Middlewares;

namespace csharp_p2.src.Config.App;

public static class AppConfig {
  public static void AddConfigs(this WebApplication app) {
    // 1) Cross-cutting no início do pipeline.
    // ExceptionHandling precisa ser o primeiro para capturar erros de QUALQUER etapa
    // (auth, middlewares, controllers) e padronizar a resposta de erro.
    // LogMiddleware também fica no começo para registrar a requisição completa,
    // incluindo falhas que ocorram antes de chegar no controller.
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<LogMiddleware>();

    // 2) Roteamento + segurança.
    // UseRouting resolve o endpoint atual.
    // UseAuthentication valida o token e popula HttpContext.User.
    // UseAuthorization aplica as políticas (incluindo fallback de autenticado).
    app.UseRouting();
    app.UseAuthentication();
    app.UseAuthorization();

    // 3) SessionRefresh após auth.
    // Esse middleware depende de contexto de rota/usuário já resolvido e deve rodar
    // depois da autenticação para não tentar renovar sessão em uma requisição ainda
    // não autenticada. Assim, regras de token/origem já foram avaliadas antes.
    app.UseMiddleware<SessionRefreshMiddleware>();

    // 4) Infraestrutura adicional que prepara resposta/observabilidade.
    CorsApp.AddCors(app);
    HangfireApp.UseHangfire(app);
    ZipApp.AddZip(app);
    SwaggerApp.AddSwagger(app);

    // 5) Despacho final do endpoint.
    // MapControllers fica no final para que todo o pipeline anterior execute antes
    // da action (log, tratamento de erro, auth, refresh e demais integrações).
    app.MapControllers();
  }
}
