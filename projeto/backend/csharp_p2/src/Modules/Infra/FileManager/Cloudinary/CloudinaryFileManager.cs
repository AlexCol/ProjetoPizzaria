using csharp_p2.src.Config;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace csharp_p2.src.Modules.Infra.FileManager;

public class CloudinaryFileManager : IFileManager {
  private static readonly HttpClient _httpClient = new();
  private readonly Cloudinary _cloudinary;
  private readonly string _baseFolder;

  /*****************************************************************/
  /* Metodos Publicos                                              */
  /*****************************************************************/
  public CloudinaryFileManager(EnvConfig env) {
    var cloudName = env.FileManager.Bucket;
    var apiKey = env.FileManager.AccessKey;
    var apiSecret = env.FileManager.SecretKey;

    if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
      throw new InvalidOperationException("[CloudinaryFileManager] Missing credentials. Expected FILE_MANAGER_BUCKET, FILE_MANAGER_ACCESS_KEY and FILE_MANAGER_SECRET_KEY.");

    var account = new Account(cloudName, apiKey, apiSecret);
    _cloudinary = new Cloudinary(account) {
      Api = {
        Secure = true
      }
    };

    _baseFolder = NormalizePath(env.FileManager.Folder);
  }

  public async Task SaveAsync(string modulePath, string fileName, Stream content, CancellationToken cancellationToken = default) {
    if (content.CanSeek)
      content.Position = 0;

    var publicId = BuildFilePublicId(fileName);
    var assetFolder = BuildAssetFolder(modulePath);
    var uploadParams = new ImageUploadParams {
      File = new FileDescription(fileName, content),
      PublicId = publicId,
      AssetFolder = assetFolder,
      Folder = assetFolder,
      Overwrite = true,
      UseFilename = false,
      UniqueFilename = false,
      Invalidate = true
    };

    var result = await _cloudinary.UploadAsync(uploadParams);
    if (result.Error != null)
      throw new InvalidOperationException($"[CloudinaryFileManager] Upload failed: {result.Error.Message}");
  }

  public async Task<Stream> ReadAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var bytes = await ReadBytesAsync(modulePath, fileName, cancellationToken);
    return new MemoryStream(bytes);
  }

  public async Task<bool> ExistsAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    foreach (var publicId in BuildPublicIdCandidates(modulePath, fileName)) {
      try {
        var result = await GetResourceByPublicIdAsync(publicId);
        if (result != null && result.Error == null)
          return true;
      } catch {
        // Try next candidate.
      }
    }

    return false;
  }

  public async Task DeleteAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    foreach (var publicId in BuildPublicIdCandidates(modulePath, fileName)) {
      try {
        var result = await GetResourceByPublicIdAsync(publicId);
        if (result == null || result.Error != null)
          continue;

        var deleteParams = new DeletionParams(publicId) {
          ResourceType = ResourceType.Image,
          Invalidate = true
        };

        await _cloudinary.DestroyAsync(deleteParams);
        return;
      } catch {
        // Try next candidate.
      }
    }
  }

  public Task SaveTextAsync(string modulePath, string fileName, string content, Encoding encoding = null, CancellationToken cancellationToken = default) {
    encoding ??= Encoding.UTF8;
    var bytes = encoding.GetBytes(content ?? string.Empty);
    return SaveBytesAsync(modulePath, fileName, bytes, cancellationToken);
  }

  public async Task<string> ReadTextAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var bytes = await ReadBytesAsync(modulePath, fileName, cancellationToken);
    return Encoding.UTF8.GetString(bytes);
  }

  public async Task SaveBytesAsync(string modulePath, string fileName, byte[] content, CancellationToken cancellationToken = default) {
    await using var stream = new MemoryStream(content);
    await SaveAsync(modulePath, fileName, stream, cancellationToken);
  }

  public async Task<byte[]> ReadBytesAsync(string modulePath, string fileName, CancellationToken cancellationToken = default) {
    var errors = new List<string>();

    foreach (var publicId in BuildPublicIdCandidates(modulePath, fileName)) {
      try {
        var result = await GetResourceByPublicIdAsync(publicId);
        if (result?.Error != null) {
          errors.Add($"{publicId}: {result.Error.Message}");
          continue;
        }

        var url = result?.SecureUrl;
        if (url == null) {
          errors.Add($"{publicId}: secure URL was not returned");
          continue;
        }

        return await _httpClient.GetByteArrayAsync(url, cancellationToken);
      } catch (Exception ex) {
        errors.Add($"{publicId}: {ex.Message}");
      }
    }

    var details = string.Join(" | ", errors);
    throw new InvalidOperationException($"[CloudinaryFileManager] Read failed. Tried all public_id patterns. {details}");
  }

  /*****************************************************************/
  /* Metodos Privados                                              */
  /*****************************************************************/
  private string BuildPublicId(string modulePath, string fileName) {
    var module = NormalizePath(modulePath);
    var file = BuildFilePublicId(fileName);

    var parts = new List<string>();
    if (!string.IsNullOrWhiteSpace(_baseFolder)) {
      parts.Add(_baseFolder);
    }
    if (!string.IsNullOrWhiteSpace(module)) {
      parts.Add(module);
    }
    if (!string.IsNullOrWhiteSpace(file)) {
      parts.Add(file);
    }

    return string.Join('/', parts);
  }

  private IEnumerable<string> BuildPublicIdCandidates(string modulePath, string fileName) {
    var fullPathPublicId = BuildPublicId(modulePath, fileName);
    if (!string.IsNullOrWhiteSpace(fullPathPublicId))
      yield return fullPathPublicId;

    var filePublicId = BuildFilePublicId(fileName);
    if (!string.IsNullOrWhiteSpace(filePublicId) && !string.Equals(filePublicId, fullPathPublicId, StringComparison.Ordinal))
      yield return filePublicId;
  }

  private async Task<GetResourceResult> GetResourceByPublicIdAsync(string publicId) {
    var getParams = new GetResourceParams(publicId) {
      ResourceType = ResourceType.Image
    };

    return await _cloudinary.GetResourceAsync(getParams);
  }

  private static string BuildFilePublicId(string fileName) {
    var fileWithoutExtension = Path.GetFileNameWithoutExtension(fileName) ?? string.Empty;
    return NormalizePath(fileWithoutExtension);
  }

  private string BuildAssetFolder(string modulePath) {
    var module = NormalizePath(modulePath);

    var parts = new List<string>();
    if (!string.IsNullOrWhiteSpace(_baseFolder)) {
      parts.Add(_baseFolder);
    }
    if (!string.IsNullOrWhiteSpace(module)) {
      parts.Add(module);
    }

    return string.Join('/', parts);
  }

  private static string NormalizePath(string value) {
    if (string.IsNullOrWhiteSpace(value))
      return string.Empty;

    return value
      .Replace('\\', '/')
      .Trim('/')
      .Trim();
  }
}
