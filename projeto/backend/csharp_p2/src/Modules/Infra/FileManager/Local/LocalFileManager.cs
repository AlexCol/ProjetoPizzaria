using csharp_p2.src.Config;

namespace csharp_p2.src.Modules.Infra.FileManager;

public class LocalFileManager : IFileManager {
  private readonly EnvConfig _env;
  private readonly string _basePath;

  public LocalFileManager(EnvConfig env) {
    _env = env;
    _basePath = PrepareBasePath();
  }

  /************************************************************************/
  /* Metodos da Interface                                                 */
  /************************************************************************/
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SAVE
  public async Task SaveAsync(string modulePath, string fileName, Stream content, CancellationToken cancellationToken = default) {
    var fullPath = ResolvePath(modulePath, fileName);

    var directory = Path.GetDirectoryName(fullPath)!;
    Directory.CreateDirectory(directory);

    await using var fileStream = new FileStream(
        fullPath,
        FileMode.Create,
        FileAccess.Write,
        FileShare.None,
        bufferSize: 4096,
        useAsync: true
    );

    await content.CopyToAsync(fileStream, cancellationToken);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!READ
  public Task<Stream> ReadAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var fullPath = ResolvePath(modulePath, fileName);

    Stream stream = new FileStream(
        fullPath,
        FileMode.Open,
        FileAccess.Read,
        FileShare.Read,
        bufferSize: 4096,
        useAsync: true
    );

    return Task.FromResult(stream);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!DELETE
  public Task DeleteAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var fullPath = ResolvePath(modulePath, fileName);
    File.Delete(fullPath);
    return Task.CompletedTask;
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!EXISTS
  public Task<bool> ExistsAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var fullPath = ResolvePath(modulePath, fileName);
    return Task.FromResult(File.Exists(fullPath));
  }

  /************************************************************************/
  /* Metodos Privados                                                     */
  /************************************************************************/
  private string ResolvePath(string modulePath, string fileName) {
    modulePath ??= string.Empty;

    var combined = Path.Combine(_basePath, modulePath, fileName);
    var fullPath = Path.GetFullPath(combined);

    var rootWithSeparator = _basePath.EndsWith(Path.DirectorySeparatorChar)
        ? _basePath
        : _basePath + Path.DirectorySeparatorChar;

    if (!fullPath.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase))
      throw new InvalidOperationException("Invalid file path.");

    return fullPath;
  }

  private string PrepareBasePath() {
    string basePath;

    var configured = _env?.FileManager?.BasePath ?? string.Empty;
    if (string.IsNullOrWhiteSpace(configured) || configured == "/" || configured == "\\") {
      var projectRoot = Directory.GetCurrentDirectory();
      basePath = Path.GetFullPath(Path.Combine(projectRoot, "images"));
    } else {
      basePath = Path.GetFullPath(configured);
    }

    return basePath;
  }
}

