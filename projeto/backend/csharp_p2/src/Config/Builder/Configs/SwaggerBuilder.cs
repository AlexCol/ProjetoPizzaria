using Microsoft.OpenApi;
using System.Text.Json.Nodes;

namespace csharp_p2.src.Extensions;

public static class SwaggerBuilder {
  public static void AddSwagger(WebApplicationBuilder builder) {
    builder.Services.AddOpenApi("v1", options => {

      //! processo para mapear enums como string (ex.: Active/Inactive) em vez de número (65/73).
      options.AddSchemaTransformer((schema, context, _) => {
        var type = context.JsonTypeInfo.Type;
        var enumType = Nullable.GetUnderlyingType(type) ?? type;
        if (!enumType.IsEnum) {
          return Task.CompletedTask;
        }

        schema.Type = JsonSchemaType.String;
        schema.Format = null;
        schema.Enum = Enum.GetNames(enumType)
          .Select(name => (JsonNode)JsonValue.Create(name)!)
          .ToList();

        return Task.CompletedTask;
      });

      //! processo para mapear os parametros em caso de useo do SearchCriteriaRequest em QueryParam
      options.AddOperationTransformer((operation, _, _) => {
        if (operation.Parameters is null || operation.Parameters.Count == 0) {
          return Task.CompletedTask;
        }

        var removedAny = operation.Parameters.Any(p => IsSearchCriteriaAutoParam(p.Name));
        if (!removedAny) {
          return Task.CompletedTask;
        }

        operation.Parameters = operation.Parameters
          .Where(p => !IsSearchCriteriaAutoParam(p.Name))
          .ToList();

        // Add custom query parameters that match the binder behavior.
        operation.Parameters.Add(new OpenApiParameter {
          Name = "sort-field",
          In = ParameterLocation.Query,
          Required = false,
          Description = "Campo de ordenacao (apenas 1).",
          Schema = new OpenApiSchema { Type = JsonSchemaType.String }
        });

        operation.Parameters.Add(new OpenApiParameter {
          Name = "sort-order",
          In = ParameterLocation.Query,
          Required = false,
          Description = "Direcao da ordenacao: asc|desc.",
          Schema = new OpenApiSchema { Type = JsonSchemaType.String }
        });

        operation.Parameters.Add(new OpenApiParameter {
          Name = "page",
          In = ParameterLocation.Query,
          Required = false,
          Description = "Pagina (default 1).",
          Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" }
        });

        operation.Parameters.Add(new OpenApiParameter {
          Name = "limit",
          In = ParameterLocation.Query,
          Required = false,
          Description = "Limite por pagina (default 25).",
          Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" }
        });

        operation.Description = AppendSearchCriteriaNote(operation.Description);
        return Task.CompletedTask;
      });

      //! processo para adicionar informações gerais da API (titulo, descrição, versão)
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

  //! metodos auxiliares para AddOperationTransformer
  private static bool IsSearchCriteriaAutoParam(string name) {
    if (string.IsNullOrWhiteSpace(name)) return false;
    var lower = name.ToLowerInvariant();
    return lower.StartsWith("where")
      || lower.StartsWith("sort")
      || lower.StartsWith("pagination")
      || lower.StartsWith("where[")
      || lower.StartsWith("sort[");
  }

  private static string AppendSearchCriteriaNote(string current) {
    const string NOTE =
      "Query params customizados: use 'sort-field', 'sort-order', 'page', 'limit'. " +
      "Qualquer outro query param vira filtro com operator=like.";

    if (string.IsNullOrWhiteSpace(current)) return NOTE;
    return current.EndsWith(".") ? $"{current} {NOTE}" : $"{current}. {NOTE}";
  }
}
