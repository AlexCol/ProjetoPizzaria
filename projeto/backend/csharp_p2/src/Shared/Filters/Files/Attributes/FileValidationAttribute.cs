namespace csharp_p2.src.Shared.Filters;

[AttributeUsage(AttributeTargets.Method)]
public sealed class FileValidationAttribute : Attribute {
  public long MaxBytes { get; init; }
  public string[] AllowedExtensions { get; init; }
  public bool Optional { get; init; } = true;
}
