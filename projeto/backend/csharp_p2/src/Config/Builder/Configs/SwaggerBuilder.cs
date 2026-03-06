namespace csharp_p2.src.Extensions;

public static class SwaggerBuilder {
  public static void AddSwagger(WebApplicationBuilder builder) {
    builder.Services.AddOpenApi("v1", options => {
      options.AddDocumentTransformer((document, _, _) => {
        document.Info = new() {
          Title = "Pizzaria API",
          Description = "API para gerenciamento de pedidos e clientes.",
          Version = "1.0"
        };

        return Task.CompletedTask;
      });
    });
  }
}
