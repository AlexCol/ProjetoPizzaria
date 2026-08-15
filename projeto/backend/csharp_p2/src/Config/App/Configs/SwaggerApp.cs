
using Scalar.AspNetCore;
using csharp_p2.src.Shared.Atributtes;

namespace csharp_p2.src.Config.App;

public static class SwaggerApp {
  public static void AddSwagger(WebApplication app) {
    if (!app.Environment.IsDevelopment()) return;

    // JSON e YAML (equivalente ao /api/docs/v1)
    app.MapOpenApi("/swagger/v1.json")
      .AllowAnonymous()
      .WithMetadata(new IgnoreAppOriginAttribute());
    app.MapOpenApi("/swagger/v1.yaml")
      .AllowAnonymous()
      .WithMetadata(new IgnoreAppOriginAttribute());

    // UI do Scalar (equivalente ao /api/docs)
    app.MapScalarApiReference("/api/docs", options => {
      options.WithTitle("API Documentation")
             .WithTheme(ScalarTheme.Kepler)
             .ForceDarkMode()
             .WithOpenApiRoutePattern("/swagger/{documentName}.json");
    })
      // AllowAnonymous não impede que o AuthenticationHandler tente autenticar
      // um cookie já presente. Este metadado permite abrir a documentação pelo
      // navegador sem app-origin, mesmo quando existe uma sessão web ativa.
      // A exceção fica restrita aos endpoints de documentação em Development.
      .AllowAnonymous()
      .WithMetadata(new IgnoreAppOriginAttribute());

    Log.Information("📊 [Swagger] Access the API documentation at /api/docs.");
  }
}
