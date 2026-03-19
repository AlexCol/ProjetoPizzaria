using csharp_p2.src.Config;

namespace csharp_p2.src.Modules.Infra.FileManager;

public class FileManagerBuilder {
  public static void AddFileManager(WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration);
    var managerType = env.FileManager.Type;

    if (managerType.Equals("local", StringComparison.OrdinalIgnoreCase)) {
      builder.Services.AddSingleton<IFileManager, LocalFileManager>();
      Log.Information("[DI] Registered LocalFileManager as IFileManager - FileManagerBuilder");
    } else if (managerType.Equals("cloudinary", StringComparison.OrdinalIgnoreCase)) {
      builder.Services.AddSingleton<IFileManager, CloudinaryFileManager>();
      Log.Information("[DI] Registered CloudinaryFileManager as IFileManager - FileManagerBuilder");
    } else
      throw new Exception($"[FileManagerBuilder] - File manager type '{managerType}' not supported!");
  }
}
