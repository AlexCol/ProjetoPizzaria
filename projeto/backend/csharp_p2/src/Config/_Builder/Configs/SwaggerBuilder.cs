namespace csharp_p2.src.Extensions;

public static class SwaggerBuilder {
  public static void AddSwagger(WebApplicationBuilder builder) {
    // string appName = "Sistema de Chamados";
    // string appVersion = "v1";
    // string appDescription = $"{appName} para controle de fluxo de processo.";
    // builder.Services.AddSwaggerGen(c => {
    //   c.SwaggerDoc(appVersion,
    //   new OpenApiInfo {
    //     Title = appName, //titulo no swagger
    //     Description = appDescription,
    //     Contact = new OpenApiContact {
    //       Name = "Alexandre"
    //     }
    //   });
    // });

    // builder.Services.AddRouting(opt => opt.LowercaseUrls = true); //!para que fique tudo em minusculo os links no swagger
  }
}
