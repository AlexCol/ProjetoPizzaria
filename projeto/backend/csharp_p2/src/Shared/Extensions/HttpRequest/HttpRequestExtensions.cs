namespace csharp_p2.src.Shared.Extensions;

public static class HttpRequestExtensions {
  public static string GetHeaderValue(this HttpRequest request, string headerName) {
    if (request.Headers.TryGetValue(headerName, out var value)) {
      return value.ToString();
    }
    return null;
  }
}
