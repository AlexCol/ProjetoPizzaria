using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;

namespace csharp_p2.src.Extensions;

public static class ZipBuilder {
  public static void AddZip(WebApplicationBuilder builder) {
    builder.Services.AddResponseCompression(options => {
      options.EnableForHttps = true; // também em HTTPS
      options.Providers.Add<GzipCompressionProvider>();
      options.Providers.Add<BrotliCompressionProvider>();
    });

    builder.Services.Configure<GzipCompressionProviderOptions>(opts => {
      opts.Level = CompressionLevel.Optimal;
    });
    builder.Services.Configure<BrotliCompressionProviderOptions>(opts => {
      opts.Level = CompressionLevel.Optimal;
    });

    //!ativada em nas DependenciesApp
  }
}
