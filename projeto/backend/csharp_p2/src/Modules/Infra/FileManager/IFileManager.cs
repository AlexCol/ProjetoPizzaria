namespace csharp_p2.src.Modules.Infra.FileManager;

public interface IFileManager {
  Task SaveAsync(string modulePath, string fileName, Stream content, CancellationToken cancellationToken = default);
  Task<Stream> ReadAsync(string modulePath, string fileName, CancellationToken cancellationToken = default); // caller must dispose
  Task<bool> ExistsAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);
  Task DeleteAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);

  // Conveniência (opcionais)
  Task SaveTextAsync(string modulePath, string fileName, string content, Encoding encoding = null, CancellationToken cancellationToken = default);
  Task<string> ReadTextAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);
  Task SaveBytesAsync(string modulePath, string fileName, byte[] content, CancellationToken cancellationToken = default);
  Task<byte[]> ReadBytesAsync(string modulePath, string fileName, CancellationToken cancellationToken = default);
}
