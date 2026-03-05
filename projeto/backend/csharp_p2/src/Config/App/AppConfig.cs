namespace csharp_p2.src.Config.App;

public static class AppConfig {
  public static void AddConfigs(this WebApplication app) {
    // //!adicionando configurações
    CorsApp.AddCors(app);
    HangfireApp.UseHangfire(app);
    MiddlewareApp.AddMiddlewares(app);
    ZipApp.AddZip(app);

    //!adicionando configurações padrão
    app.UseAuthentication();
    app.UseAuthorization();
    //app.UseHttpsRedirection();
    app.MapControllers();
  }
}
