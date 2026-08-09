using csharp_p2.src.Shared.Middlewares;

namespace csharp_p2.src.Config.App;

public static class AppConfig {
  public static void AddConfigs(this WebApplication app) {
    var env = app.Services.GetRequiredService<EnvConfig>();

    // Processa X-Forwarded-For e X-Forwarded-Proto somente quando enviados
    // por proxies explicitamente confiáveis. Deve executar antes dos logs,
    // do rate limiter e de qualquer lógica que consulte IP ou protocolo.
    app.UseForwardedHeaders();

    // 1) Cross-cutting no inicio do pipeline da aplicacao.
    // Depois do processamento de infraestrutura do proxy, ExceptionHandling precisa
    // vir antes dos demais middlewares da aplicacao para capturar seus erros
    // (auth, middlewares, controllers) e padronizar a resposta.
    // LogMiddleware tambem fica no comeco para registrar a requisicao completa,
    // incluindo falhas que ocorram antes de chegar no controller.
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<LogMiddleware>();

    // Em ambientes publicados, informa ao navegador que o host deve ser acessado
    // somente por HTTPS e redireciona acessos HTTP para a porta pública 443.
    // ForwardedHeaders precisa vir antes para reconhecer o HTTPS terminado no proxy
    // e impedir um loop de redirecionamento.
    if (!env.IsDevelopment) {
      app.UseHsts();
      app.UseHttpsRedirection();
    }

    // 2) Roteamento + seguranca.
    // UseRouting resolve o endpoint atual.
    // UseCors precisa vir logo apos UseRouting para que respostas 401/403
    // tambem recebam headers CORS.
    // UseRateLimiter adiciona o middleware de rate limiting
    // UseAuthentication valida o token e popula HttpContext.User.
    // UseAuthorization aplica as politicas (incluindo fallback de autenticado).
    app.UseRouting();
    CorsApp.AddCors(app);
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    // 3) SessionRefresh apos auth.
    // Esse middleware depende de contexto de rota/usuario ja resolvido e deve rodar
    // depois da autenticacao para nao tentar renovar sessao em uma requisicao ainda
    // nao autenticada. Assim, regras de token/origem ja foram avaliadas antes.
    app.UseMiddleware<SessionRefreshMiddleware>();

    // 4) Infraestrutura adicional que prepara resposta/observabilidade.
    HangfireApp.UseHangfire(app);
    ZipApp.AddZip(app);
    SwaggerApp.AddSwagger(app);

    // 5) Despacho final do endpoint.
    // MapControllers fica no final para que todo o pipeline anterior execute antes
    // da action (log, tratamento de erro, auth, refresh e demais integracoes).
    app.MapControllers();
  }
}
