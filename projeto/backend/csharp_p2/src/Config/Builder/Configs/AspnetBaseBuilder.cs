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
      // Define application/json como o tipo de conteúdo produzido pelos controllers.
      options.Filters.Add(new ProducesAttribute("application/json"));

      // Coloca o binder personalizado no início da lista para que ele tenha prioridade sobre os binders padrão.
      // Ele transforma a query string em SearchCriteriaRequest<T>, separando filtros, ordenação e paginação.
      options.ModelBinderProviders.Insert(0, new SearchCriteriaFromQueryBinderProvider());

      // Valida todo argumento SearchCriteriaRequest<T> com SearchCriteriaRequestValidator<T> antes da action.
      // Se algum critério for inválido, interrompe a requisição e retorna HTTP 400 com os erros encontrados.
      options.Filters.Add<SearchCriteriaValidationFilter>();

      // Localiza arquivos recebidos diretamente, em coleções ou dentro dos DTOs e os valida antes da action.
      // Verifica obrigatoriedade, tamanho máximo e extensões permitidas conforme as opções globais ou o atributo do endpoint.
      options.Filters.Add<FileValidationFilter>();

      // Remove a validação implícita de propriedades non-nullable para permitir o uso de NotNull.
      options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;

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
