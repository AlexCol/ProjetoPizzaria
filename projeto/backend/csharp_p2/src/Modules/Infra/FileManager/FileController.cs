using csharp_p2.src.Shared.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.StaticFiles;

namespace csharp_p2.src.Modules.Infra.FileManager;

[ApiController]
[Route("api/[controller]")]
public class FileController : ControllerBase {
  private readonly IFileManager _fileManager;
  private static readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

  public FileController(IFileManager fileManager) {
    _fileManager = fileManager;
  }

  [HttpGet("download")]
  public async Task<IActionResult> GetFileAsync(
    [FromQuery] string modulePath,
    [FromQuery] string fileName
    ) {
    if (string.IsNullOrWhiteSpace(modulePath) || string.IsNullOrWhiteSpace(fileName))
      throw new CustomError("Module path and file name are required.", 400);

    try {
      var fileStream = await _fileManager.ReadAsync(modulePath, fileName);
      return File(fileStream, "application/octet-stream", fileName);
    } catch (Exception ex) {
      throw new CustomError($"Failed to retrieve file: {ex.Message}", 500);
    }
  }

  [HttpGet("view")]
  [AllowAnonymous]
  public async Task<IActionResult> ViewFileAsync(
    [FromQuery] string modulePath,
    [FromQuery] string fileName
    ) {
    if (string.IsNullOrWhiteSpace(modulePath) || string.IsNullOrWhiteSpace(fileName))
      throw new CustomError("Module path and file name are required.", 400);

    try {
      var fileStream = await _fileManager.ReadAsync(modulePath, fileName);
      if (!_contentTypeProvider.TryGetContentType(fileName, out var contentType))
        contentType = "application/octet-stream";

      // No fileDownloadName => browser renders inline when supported (ex: images).
      return File(fileStream, contentType);
    } catch (Exception ex) {
      throw new CustomError($"Failed to retrieve file: {ex.Message}", 500);
    }
  }
}
