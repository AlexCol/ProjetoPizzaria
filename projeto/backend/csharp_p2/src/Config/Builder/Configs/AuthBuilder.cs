using csharp_p2.src.Modules.Auth.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
namespace csharp_p2.src.Config.Builder;

public static class AuthBuilder {
  public static void AddAuthentication(WebApplicationBuilder builder) {
    //! Configura o esquema de autenticação baseado em sessão, responsável por validar o token
    //! da requisição e, quando válido, produzir a identidade usada para popular HttpContext.User.
    builder.Services
        .AddAuthentication(options => {
          options.DefaultAuthenticateScheme = SessionAuthDefaults.SCHEME;
          options.DefaultChallengeScheme = SessionAuthDefaults.SCHEME;
        })
        .AddScheme<AuthenticationSchemeOptions, SessionAuthHandler>(
          SessionAuthDefaults.SCHEME, _ => { }
        );

    //! Configura a política de fallback para exigir autenticação em todas as rotas,
    //! exceto quando o endpoint for explicitamente marcado com [AllowAnonymous].
    builder.Services.AddAuthorizationBuilder()
      .SetFallbackPolicy(
        new AuthorizationPolicyBuilder()
          .AddAuthenticationSchemes(SessionAuthDefaults.SCHEME)
          .RequireAuthenticatedUser()
          .Build()
      );
  }
}
