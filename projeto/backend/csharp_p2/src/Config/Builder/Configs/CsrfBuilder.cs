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
