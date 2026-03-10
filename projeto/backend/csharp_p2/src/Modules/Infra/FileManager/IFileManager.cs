namespace csharp_p2.src.Modules.Infra.FileManager;

public interface IFileManager {
  Task SaveAsync(string path, Stream content, CancellationToken cancellationToken = default);
  Task<Stream> ReadAsync(string path, CancellationToken cancellationToken = default); // caller must dispose
  Task<bool> ExistsAsync(string path, CancellationToken cancellationToken = default);
  Task DeleteAsync(string path, CancellationToken cancellationToken = default);

  // Conveniência (opcionais)
  Task SaveTextAsync(string path, string content, Encoding encoding = null, CancellationToken cancellationToken = default);
  Task<string> ReadTextAsync(string path, CancellationToken cancellationToken = default);
  Task SaveBytesAsync(string path, byte[] content, CancellationToken cancellationToken = default);
  Task<byte[]> ReadBytesAsync(string path, CancellationToken cancellationToken = default);
}
