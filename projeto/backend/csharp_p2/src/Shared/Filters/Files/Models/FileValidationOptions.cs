using csharp_p2.src.Config;
using csharp_p2.src.Config.Builder;

namespace csharp_p2.src.Shared.Filters;

[Injectable(typeof(FileValidationOptions), EServiceLifetimeType.Singleton)]
public sealed class FileValidationOptions {
  public long MaxBytes { get; init; }
  public string[] AllowedExtensions { get; init; }

  public FileValidationOptions(EnvConfig env) {
    MaxBytes = env.FileManager.MaxBytes;
    AllowedExtensions = env.FileManager.AllowedExtensions;
  }
}
