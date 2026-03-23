
using Scalar.AspNetCore;

namespace csharp_p2.src.Config.App;

public static class SwaggerApp {
  public static void AddSwagger(WebApplication app) {
    if (!app.Environment.IsDevelopment()) return;

    // JSON e YAML (equivalente ao /api/docs/v1)
    app.MapOpenApi("/swagger/v1.json").AllowAnonymous();
    app.MapOpenApi("/swagger/v1.yaml").AllowAnonymous();

    // UI do Scalar (equivalente ao /api/docs)
    app.MapScalarApiReference("/api/docs", options => {
      options.WithTitle("API Documentation")
             .WithTheme(ScalarTheme.Kepler)
             .ForceDarkMode()
             .WithOpenApiRoutePattern("/swagger/{documentName}.json");
    }).AllowAnonymous();

    Log.Information("📊 [Swagger] Access the API documentation at /api/docs.");
  }
}
