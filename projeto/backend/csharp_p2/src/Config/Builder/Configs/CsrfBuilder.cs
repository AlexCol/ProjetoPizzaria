namespace csharp_p2.src.Config.Builder;

public static class CsrfBuilder {
  public const string HEADER_NAME = "X-CSRF-TOKEN";

  public static void AddCsrf(WebApplicationBuilder builder, EnvConfig env) {
    builder.Services.AddAntiforgery(options => {
      options.HeaderName = HEADER_NAME;
      options.Cookie.Name = env.IsDevelopment ? "p2_csrf" : "__Host-p2-csrf";
      options.Cookie.HttpOnly = true;
      options.Cookie.SecurePolicy = env.IsDevelopment ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
      options.Cookie.SameSite = env.IsProduction ? SameSiteMode.None : SameSiteMode.Lax;
      options.Cookie.Path = "/";
    });
  }
}

/*
 * Fluxo de proteção CSRF:
 *
 * 1. O AddAntiforgery() registra e configura os serviços de antiforgery do ASP.NET Core,
 *    incluindo o cookie antiforgery e o header utilizado para receber o request token.
 *    Esse registro, sozinho, não determina em quais requisições a validação deve ocorrer.
 *
 * 2. Antes de uma operação protegida, o cliente chama o endpoint responsável por gerar
 *    o token CSRF. Esse endpoint utiliza IAntiforgery.GetAndStoreTokens(HttpContext):
 *
 *      - o cookie antiforgery é criado/garantido e enviado ao cliente;
 *      - um request token é gerado e retornado no corpo da resposta.
 *
 *    O cookie antiforgery pode ser HttpOnly, pois o frontend não precisa acessá-lo.
 *    O navegador o envia automaticamente, enquanto o request token deve ser enviado
 *    explicitamente pelo cliente no header configurado em AddAntiforgery().
 *
 * 3. A autenticação precisa ser executada antes da geração ou validação do antiforgery.
 *    O UseAuthentication() aciona o SessionAuthHandler, que:
 *
 *      - obtém o token de sessão da requisição;
 *      - valida a sessão;
 *      - cria as Claims;
 *      - cria o ClaimsPrincipal;
 *      - popula HttpContext.User com a identidade autenticada.
 *
 *    Isso é importante porque o antiforgery considera a identidade atual presente em
 *    HttpContext.User ao gerar e validar o request token.
 *
 * 4. Antes do login, HttpContext.User ainda representa um usuário anônimo. Por isso,
 *    o cliente deve obter um token CSRF antes do login quando o endpoint de login também
 *    estiver protegido contra CSRF.
 *
 * 5. Após o login, a sessão é criada e as próximas requisições passam a produzir um
 *    HttpContext.User autenticado. O cliente deve então obter novamente o token CSRF,
 *    para que o novo request token seja gerado considerando a identidade autenticada.
 *
 *    O antiforgery não é vinculado diretamente ao valor do cookie de sessão. O cookie
 *    de sessão é utilizado pelo mecanismo de autenticação para construir HttpContext.User,
 *    e é essa identidade que influencia o antiforgery.
 *
 * 6. O CsrfProtectionMiddleware define QUANDO a validação deve ocorrer. Atualmente,
 *    somente métodos que podem alterar estado são considerados:
 *
 *      POST, PUT, PATCH e DELETE.
 *
 * 7. Requisições que possuem Authorization header não passam pela validação CSRF.
 *    Esse tipo de credencial é enviado explicitamente pelo cliente e não é anexado
 *    automaticamente pelo navegador, portanto não possui o mesmo vetor de ataque
 *    existente na autenticação baseada em cookies.
 *
 * 8. Nas requisições sem Authorization header, a validação CSRF é exigida quando:
 *
 *      - o endpoint possui RequireCsrfProtectionAttribute; ou
 *      - existe o cookie de sessão da aplicação.
 *
 *    O atributo permite proteger operações como o login, nas quais ainda não existe
 *    cookie de sessão, sem acoplar o middleware a URLs específicas.
 *
 * 9. Quando a validação é necessária, o middleware executa:
 *
 *      IAntiforgery.ValidateRequestAsync(HttpContext)
 *
 *    O ASP.NET Core valida o conjunto formado pelo cookie antiforgery, pelo request
 *    token enviado no header e pelo contexto/identidade atual da requisição.
 *
 * 10. Por esse motivo, a ordem do pipeline é importante:
 *
 *      app.UseAuthentication();
 *      app.UseAuthorization();
 *      app.UseMiddleware<CsrfProtectionMiddleware>();
 *
 *    O CsrfProtectionMiddleware deve executar depois da autenticação, garantindo que
 *    HttpContext.User já esteja corretamente preenchido antes da validação antiforgery.
 *
 * Resumo do fluxo:
 *
 *   GET /csrf-token antes do login
 *        -> gera token para contexto anônimo
 *
 *   POST /login
 *        -> envia cookie antiforgery + request token
 *        -> login cria a sessão
 *
 *   GET /csrf-token após o login
 *        -> SessionAuthHandler popula HttpContext.User
 *        -> gera novo request token para o contexto autenticado
 *
 *   POST/PUT/PATCH/DELETE autenticado por cookie
 *        -> navegador envia session cookie + antiforgery cookie
 *        -> cliente envia request token no header
 *        -> CsrfProtectionMiddleware chama ValidateRequestAsync()
 *
 *   POST/PUT/PATCH/DELETE autenticado via Authorization
 *        -> validação CSRF é ignorada
 */
