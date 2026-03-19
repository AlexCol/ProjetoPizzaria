namespace csharp_p2.src.Modules.Infra.FileManager;

public interface IFileManager {
  Task SaveAsync(string modulePath, string fileName, Stream content, CancellationToken cancellationToken = default);
  Task<Stream> ReadAsync(string modulePath, string fileName, CancellationToken cancellationToken = default); // caller must dispose
  Task DeleteAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);
  Task<bool> ExistsAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);
}
