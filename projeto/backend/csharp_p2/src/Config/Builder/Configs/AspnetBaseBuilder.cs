using csharp_p2.src.Shared.Filters;
using csharp_p2.src.Shared.Pagination;
using csharp_p2.src.Shared.Serialization;
using System.Text.Json.Serialization;

namespace csharp_p2.src.Config.Builder;

public static class AspnetBaseBuilder {
  public static void AddBaseConfigs(WebApplicationBuilder builder) {
    //!adicionando configurações padrão
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddControllers(options => {
      options.ModelBinderProviders.Insert(0, new SearchCriteriaFromQueryBinderProvider());

      options.Filters.Add<SearchCriteriaValidationFilter>();
      options.Filters.Add<FileValidationFilter>();

      options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true; //* Remove a validação automática do ModelState (pra poder usar NotNull e não impedir o envio do json)

    })
    .AddJsonOptions(options => {
      //Rejeita propriedades extras não definidas no DTO
      options.JsonSerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;

      // Serializa enums como texto (ex.: Active/Inactive) em vez de número (65/73).
      options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false));

      // Serializa Int64 como string para preservar precisão no frontend JavaScript.
      options.JsonSerializerOptions.Converters.Add(new LongAsStringJsonConverter());
      options.JsonSerializerOptions.Converters.Add(new NullableLongAsStringJsonConverter());

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
