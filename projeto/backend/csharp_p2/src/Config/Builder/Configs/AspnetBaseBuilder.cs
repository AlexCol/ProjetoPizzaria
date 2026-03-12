using csharp_p2.src.Shared.Pagination;
using System.Text.Json.Serialization;

namespace csharp_p2.src.Config.Builder;

public static class AspnetBaseBuilder {
  public static void AddBaseConfigs(WebApplicationBuilder builder) {
    //!adicionando configurações padrão
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddControllers(options => {
      options.ModelBinderProviders.Insert(0, new SearchCriteriaFromQueryBinderProvider());
      options.Filters.Add<SearchCriteriaValidationFilter>();
      options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true; //* Remove a validação automática do ModelState (pra poder usar NotNull e não impedir o envio do json)

    })
    .AddJsonOptions(options => {
      //Rejeita propriedades extras não definidas no DTO
      options.JsonSerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;

      // Ignora ciclos: inclui a primeira referência (Category -> Products)
      // e corta referências cíclicas seguintes (Product.Category ficará nulo).
      options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

      // Opcional: não escrever campos null para reduzir payload
      options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
    builder.Services.AddHttpContextAccessor();

    // Força o Kestrel a usar a configuração do appsettings.json
    builder.WebHost.UseKestrel(options => {
      options.Configure(builder.Configuration.GetSection("Kestrel"));
    });

    // Ignora qualquer variável de ambiente ASPNETCORE_URLS
    builder.WebHost.UseUrls(); // sem argumentos, ignora a variável
  }
}
