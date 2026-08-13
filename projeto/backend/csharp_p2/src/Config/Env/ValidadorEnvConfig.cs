namespace csharp_p2.src.Config;

public static class ValidadorEnvConfig {
  public static void ValidaFrondEnd(FrondEnd value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    AddIfMissing(missing, "FRONTEND_URL", value.Url);

    if (!string.IsNullOrWhiteSpace(value.Url)) {
      if (!Uri.TryCreate(value.Url, UriKind.Absolute, out var uri)
          || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
          || uri.PathAndQuery != "/"
          || !string.IsNullOrEmpty(uri.Fragment)) {
        invalid.Add("FRONTEND_URL");
      } else if (isProduction && uri.Scheme != Uri.UriSchemeHttps) {
        invalid.Add("FRONTEND_URL");
      }
    }

    ThrowIfInvalid(nameof(FrondEnd), missing, invalid);
  }

  public static void ValidaAdminUser(AdminUser value, bool isProduction) {
    if (!isProduction) return;

    var missing = new List<string>();
    AddIfMissing(missing, "ADMIN_EMAIL", value.Email);
    AddIfMissing(missing, "ADMIN_PASSWORD", value.Password);
    ThrowIfInvalid(nameof(AdminUser), missing, []);
  }

  public static void ValidaDatabase(Database value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction) {
      AddIfMissing(missing, "DB_TYPE", value.Type);
      AddIfMissing(missing, "DB_HOST", value.Host);
      AddIfMissing(missing, "DB_PORT", value.Port);
      AddIfMissing(missing, "DB_USER", value.User);
      AddIfMissing(missing, "DB_PASS", value.Password);
      AddIfMissing(missing, "DB_NAME", value.Name);
    }

    if (!string.IsNullOrWhiteSpace(value.Type) && !IsOneOf(value.Type, "Postgres", "Oracle"))
      invalid.Add("DB_TYPE");

    if (!string.IsNullOrWhiteSpace(value.Port)
        && (!int.TryParse(value.Port, out var port) || port is <= 0 or > 65535))
      invalid.Add("DB_PORT");

    if (value.MinPool < 0 || value.MaxPool <= 0 || value.MinPool > value.MaxPool)
      invalid.Add("DB_MIN_POOL/DB_MAX_POOL");

    if (value.AcquireTimeoutMillis <= 0 || value.IdleTimeoutMillis <= 0)
      invalid.Add("DB_ACQUIRE_TIMEOUT_MILLIS/DB_IDLE_TIMEOUT_MILLIS");

    ThrowIfInvalid(nameof(Database), missing, invalid);
  }

  public static void ValidaCache(CacheConfig value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction)
      AddIfMissing(missing, "CACHE_TYPE", value.Type);

    if (!string.IsNullOrWhiteSpace(value.Type) && !IsOneOf(value.Type, "Memory", "Redis"))
      invalid.Add("CACHE_TYPE");

    if (value.Type.Equals("Redis", StringComparison.OrdinalIgnoreCase)) {
      AddIfMissing(missing, "CACHE_HOST", value.Host);
      if (isProduction)
        AddIfMissing(missing, "CACHE_PASSWORD", value.Password);

      if (value.Port is <= 0 or > 65535)
        invalid.Add("CACHE_PORT");
      if (value.Db < 0)
        invalid.Add("CACHE_DB");
      if (value.ConnectTimeoutMillis <= 0 || value.AsyncTimeoutMillis <= 0)
        invalid.Add("CACHE_CONNECT_TIMEOUT_MILLIS/CACHE_ASYNC_TIMEOUT_MILLIS");
      if (value.ConnectRetry < 0 || value.KeepAliveSeconds <= 0)
        invalid.Add("CACHE_CONNECT_RETRY/CACHE_KEEP_ALIVE_SECONDS");
    }

    if (value.BaseTtlInSec <= 0 || value.SessionTtlInSec <= 0)
      invalid.Add("CACHE_BASE_TTL_IN_SEC/CACHE_SESSION_TTL_IN_SEC");

    ThrowIfInvalid(nameof(CacheConfig), missing, invalid);
  }

  public static void ValidaEmail(Email value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction) {
      AddIfMissing(missing, "EMAIL_HOST", value.Host);
      AddIfMissing(missing, "EMAIL_USER", value.User);
      AddIfMissing(missing, "EMAIL_PASS", value.Password);
      if (!value.Secure)
        invalid.Add("EMAIL_SECURE");
    }

    if (value.Port is <= 0 or > 65535)
      invalid.Add("EMAIL_PORT");

    ThrowIfInvalid(nameof(Email), missing, invalid);
  }

  public static void ValidaCrypto(Crypto value, bool isProduction) {
    if (!isProduction) return;

    var missing = new List<string>();
    var invalid = new List<string>();
    AddIfMissing(missing, "CRYPTO_SECRET", value.Secret);

    if (Encoding.UTF8.GetByteCount(value.Secret) is not (16 or 24 or 32))
      invalid.Add("CRYPTO_SECRET");

    ThrowIfInvalid(nameof(Crypto), missing, invalid);
  }

  public static void ValidaFileManager(FileManager value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction)
      AddIfMissing(missing, "FILE_MANAGER_TYPE", value.Type);

    if (!string.IsNullOrWhiteSpace(value.Type) && !IsOneOf(value.Type, "Local", "Cloudinary")) {
      invalid.Add("FILE_MANAGER_TYPE");
    } else if (value.Type.Equals("Cloudinary", StringComparison.OrdinalIgnoreCase)) {
      AddIfMissing(missing, "FILE_MANAGER_BUCKET", value.Bucket);
      AddIfMissing(missing, "FILE_MANAGER_ACCESS_KEY", value.AccessKey);
      AddIfMissing(missing, "FILE_MANAGER_SECRET_KEY", value.SecretKey);
    }

    if (value.MaxBytes <= 0)
      invalid.Add("FILEX_MAX_BYTES");
    if (value.AllowedExtensions.Length == 0)
      invalid.Add("FILEX_ALLOWED_EXTENSIONS");

    ThrowIfInvalid(nameof(FileManager), missing, invalid);
  }

  public static void ValidaRateLimit(RateLimit value) {
    var invalid = new List<string>();
    ValidaRateLimit(value.Login, "RateLimiting:Login", invalid);
    ValidaRateLimit(value.EmailDelivery, "RateLimiting:EmailDelivery", invalid);
    ValidaRateLimit(value.TokenOperation, "RateLimiting:TokenOperation", invalid);
    ValidaRateLimit(value.Default, "RateLimiting:Default", invalid);
    ThrowIfInvalid(nameof(RateLimit), [], invalid);
  }

  public static void ValidaForwardedHeaders(ForwardedHeadersConfig value) {
    var invalid = new List<string>();
    if (value.ForwardLimit <= 0)
      invalid.Add("FORWARDED_HEADERS_LIMIT");
    ThrowIfInvalid(nameof(ForwardedHeadersConfig), [], invalid);
  }

  public static void ValidaHostFiltering(HostFilteringConfig value, bool isProduction) {
    if (!isProduction) return;

    var missing = new List<string>();
    var invalid = new List<string>();
    AddIfMissing(missing, "ALLOWED_HOSTS", value.AllowedHosts);

    if (value.AllowedHosts.Contains("*"))
      invalid.Add("ALLOWED_HOSTS");

    ThrowIfInvalid(nameof(HostFilteringConfig), missing, invalid);
  }

  private static void ValidaRateLimit(RateLimitConfig value, string name, List<string> invalid) {
    if (value.PermitLimit <= 0)
      invalid.Add(name + ":PermitLimit");
    if (value.WindowSeconds <= 0)
      invalid.Add(name + ":WindowSeconds");
  }

  private static void AddIfMissing(List<string> missing, string name, string value) {
    if (string.IsNullOrWhiteSpace(value))
      missing.Add(name);
  }

  private static void AddIfMissing(List<string> missing, string name, string[] values) {
    if (values.Length == 0)
      missing.Add(name);
  }

  private static bool IsOneOf(string value, params string[] allowedValues) {
    return allowedValues.Contains(value, StringComparer.OrdinalIgnoreCase);
  }

  private static void ThrowIfInvalid(string section, List<string> missing, List<string> invalid) {
    if (missing.Count == 0 && invalid.Count == 0) return;

    var problems = new List<string>();
    if (missing.Count > 0)
      problems.Add("missing: " + string.Join(", ", missing.Distinct()));
    if (invalid.Count > 0)
      problems.Add("invalid: " + string.Join(", ", invalid.Distinct()));

    throw new InvalidOperationException(
      $"Environment configuration validation failed for '{section}' ({string.Join("; ", problems)})."
    );
  }
}
