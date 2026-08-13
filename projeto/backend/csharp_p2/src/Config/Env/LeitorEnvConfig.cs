namespace csharp_p2.src.Config;

public static class LeitorEnvConfig {
  public static int LeInt(IConfiguration config, string name, int defaultValue) {
    var value = config[name];
    if (string.IsNullOrWhiteSpace(value)) return defaultValue;

    if (int.TryParse(value, out var parsed)) return parsed;
    throw ValorInvalido(name);
  }

  public static long LeLong(IConfiguration config, string name, long defaultValue) {
    var value = config[name];
    if (string.IsNullOrWhiteSpace(value)) return defaultValue;

    if (long.TryParse(value, out var parsed)) return parsed;
    throw ValorInvalido(name);
  }

  public static bool LeBool(IConfiguration config, string name, bool defaultValue) {
    var value = config[name];
    if (string.IsNullOrWhiteSpace(value)) return defaultValue;

    if (bool.TryParse(value, out var parsed)) return parsed;
    throw ValorInvalido(name);
  }

  private static InvalidOperationException ValorInvalido(string name) {
    return new InvalidOperationException($"Configuration '{name}' has an invalid value.");
  }
}
