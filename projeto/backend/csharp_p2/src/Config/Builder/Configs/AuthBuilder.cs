using csharp_p2.src.Modules.Auth.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
namespace csharp_p2.src.Config.Builder;

public static class AuthBuilder {
  public static void AddAuthentication(WebApplicationBuilder builder) {
    builder.Services
      .AddAuthentication(options => {
        options.DefaultAuthenticateScheme = SessionAuthDefaults.SCHEME;
        options.DefaultChallengeScheme = SessionAuthDefaults.SCHEME;
      })
      .AddScheme<AuthenticationSchemeOptions, SessionAuthHandler>(
        SessionAuthDefaults.SCHEME, _ => { });

    builder.Services.AddAuthorization(options => {
      options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes(SessionAuthDefaults.SCHEME)
        .RequireAuthenticatedUser()
        .Build();
    });
  }
}
