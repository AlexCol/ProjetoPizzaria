namespace csharp_p2.src.Extensions;

public static class CorsBuilder {
  public static void AddCors(WebApplicationBuilder builder) {
    //! adicionando liberação para que se permita o consumo da API por outra origem que não C# e fora do dominio
    //? precisa depois adicionar o useCors no app
    builder.Services.AddCors(opt => {
      opt.AddDefaultPolicy(build => {
        build
          .AllowAnyOrigin()
          .AllowAnyHeader()
          .AllowAnyMethod();
      });
      // opt.AddPolicy("CORSAllowLocalHost", build => {
      // 	build
      // 			.WithOrigins("http://localhost:3011") // Substitua pela origem específica do seu frontend
      // 			.SetIsOriginAllowedToAllowWildcardSubdomains() // Permite subdomínios (opcional) -- necessário se não informar a porta
      // 			.AllowAnyHeader()
      // 			.AllowAnyMethod()
      // 			.AllowCredentials();
      // });
    }
    );
  }
}
