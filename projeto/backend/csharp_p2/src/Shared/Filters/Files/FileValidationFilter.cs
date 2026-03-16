using System.Reflection;
using csharp_p2.src.Config.Builder;
using Microsoft.AspNetCore.Mvc.Filters;

namespace csharp_p2.src.Shared.Filters;

[Injectable(typeof(FileValidationFilter), EServiceLifetimeType.Singleton)]
public sealed class FileValidationFilter : IAsyncActionFilter {
  private readonly FileValidationOptions _options;

  public FileValidationFilter(FileValidationOptions options) {
    _options = options;
  }

  public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next) {
    try {
      //! para manipular os defaults, usar o atributo FileValidation
      //! exemplo de uso no controller de criação de produto.
      var endpointAttr = context.ActionDescriptor.EndpointMetadata
        .OfType<FileValidationAttribute>()
        .FirstOrDefault();

      var maxBytes = endpointAttr?.MaxBytes ?? _options.MaxBytes;
      var allowed = (endpointAttr?.AllowedExtensions ?? _options.AllowedExtensions)
        .Select(e => e.ToLowerInvariant())
        .ToHashSet();

      var optional = endpointAttr?.Optional ?? true;

      var files = context.ActionArguments.Values
        .SelectMany(v => ExtractFiles(v))
        .ToList();

      if (!optional && files.Count == 0) {
        throw new Exception("Nenhum arquivo enviado, mas pelo menos um é obrigatório.");
      }

      foreach (var file in files) {
        if (file is null || file.Length == 0) continue;

        if (file.Length > maxBytes) {
          throw new Exception($"Arquivo {file.FileName} excede o tamanho máximo de {maxBytes} bytes.");
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext)) {
          throw new Exception($"Extensão {ext} não permitida. Permitidas: {string.Join(", ", allowed)}");
        }
      }

      await next();
    } catch (Exception ex) {
      context.Result = new BadRequestObjectResult(new { errors = new[] { ex.Message } });
    }
  }

  private static IEnumerable<IFormFile> ExtractFiles(object arg) {
    if (arg is null) yield break;

    if (arg is IFormFile f) {
      yield return f;
      yield break;
    }

    if (arg is IEnumerable<IFormFile> many) {
      foreach (var x in many) yield return x;
      yield break;
    }

    var props = arg.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
    foreach (var p in props) {
      // Skip indexer properties (e.g. List<T>.Item[int]) that require parameters.
      if (p.GetIndexParameters().Length > 0) continue;

      var val = p.GetValue(arg);
      if (val is IFormFile pf) yield return pf;
      else if (val is IEnumerable<IFormFile> pm)
        foreach (var x in pm) yield return x;
    }
  }
}
