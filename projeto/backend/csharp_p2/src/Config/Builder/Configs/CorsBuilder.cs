namespace csharp_p2.src.Extensions;

public static class CorsBuilder {
  public static void AddCors(WebApplicationBuilder builder) {
    var env = new Config.EnvConfig(builder.Configuration);
    var frontendUrl = (env.FrondEnd.Url ?? string.Empty).Trim().TrimEnd('/');

    var allowedOrigins = string.IsNullOrWhiteSpace(frontendUrl)
      ? new[] {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000"
      }
      : new[] {
        frontendUrl,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "https://127.0.0.1:3000"
      };

    builder.Services.AddCors(opt => {
      opt.AddDefaultPolicy(build => {
        build
          .WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials();
      });

      // Politica especifica para SSE (conexoes persistentes com autenticacao)
      opt.AddPolicy("SSEPolicy", build => {
        build
          .WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()
          .WithExposedHeaders("Content-Type", "X-Custom-Header");
      });
    });
  }
}
