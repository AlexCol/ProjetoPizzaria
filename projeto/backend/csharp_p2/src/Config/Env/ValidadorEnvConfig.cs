namespace csharp_p2.src.Config;

public static class ValidadorEnvConfig {
  public static void ValidaFrondEnd(FrondEnd value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    AddIfMissing(missing, "FRONTEND_URL", value.Url);

    var temUrl = !string.IsNullOrWhiteSpace(value.Url);
    if (temUrl) {
      var urlEhAbsoluta = Uri.TryCreate(value.Url, UriKind.Absolute, out var uri);
      var urlNaoEhAbsoluta = !urlEhAbsoluta;
      var protocoloEhHttp = urlEhAbsoluta && uri!.Scheme == Uri.UriSchemeHttp;
      var protocoloEhHttps = urlEhAbsoluta && uri!.Scheme == Uri.UriSchemeHttps;
      var protocoloNaoEhValido = !protocoloEhHttp && !protocoloEhHttps;
      var temPathOuQuery = urlEhAbsoluta && uri!.PathAndQuery != "/";
      var temFragmento = urlEhAbsoluta && !string.IsNullOrEmpty(uri!.Fragment);

      if (urlNaoEhAbsoluta || protocoloNaoEhValido || temPathOuQuery || temFragmento) {
        invalid.Add("FRONTEND_URL");
      } else {
        var producaoSemHttps = isProduction && !protocoloEhHttps;
        if (producaoSemHttps)
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

    var temTipoDatabase = !string.IsNullOrWhiteSpace(value.Type);
    var tipoDatabaseEhSuportado = IsOneOf(value.Type, "Postgres", "Oracle");
    if (temTipoDatabase && !tipoDatabaseEhSuportado)
      invalid.Add("DB_TYPE");

    var temPorta = !string.IsNullOrWhiteSpace(value.Port);
    var portaEhNumero = int.TryParse(value.Port, out var port);
    var portaNaoEhNumero = !portaEhNumero;
    var portaNaoEhPositiva = portaEhNumero && port <= 0;
    var portaAcimaDoLimite = portaEhNumero && port > 65535;
    if (temPorta && (portaNaoEhNumero || portaNaoEhPositiva || portaAcimaDoLimite))
      invalid.Add("DB_PORT");

    var poolMinimoEhNegativo = value.MinPool < 0;
    var poolMaximoNaoEhPositivo = value.MaxPool <= 0;
    var poolMinimoMaiorQueMaximo = value.MinPool > value.MaxPool;
    if (poolMinimoEhNegativo || poolMaximoNaoEhPositivo || poolMinimoMaiorQueMaximo)
      invalid.Add("DB_MIN_POOL/DB_MAX_POOL");

    var acquireTimeoutNaoEhPositivo = value.AcquireTimeoutMillis <= 0;
    var idleTimeoutNaoEhPositivo = value.IdleTimeoutMillis <= 0;
    if (acquireTimeoutNaoEhPositivo || idleTimeoutNaoEhPositivo)
      invalid.Add("DB_ACQUIRE_TIMEOUT_MILLIS/DB_IDLE_TIMEOUT_MILLIS");

    ThrowIfInvalid(nameof(Database), missing, invalid);
  }

  public static void ValidaCache(CacheConfig value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction)
      AddIfMissing(missing, "CACHE_TYPE", value.Type);

    var temTipoCache = !string.IsNullOrWhiteSpace(value.Type);
    var tipoCacheEhSuportado = IsOneOf(value.Type, "Memory", "Redis", "Valkey");
    if (temTipoCache && !tipoCacheEhSuportado)
      invalid.Add("CACHE_TYPE");

    var cacheEhRedis = value.Type.Equals("Redis", StringComparison.OrdinalIgnoreCase);
    var cacheEhValkey = value.Type.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
    var cacheEhDistribuido = cacheEhRedis || cacheEhValkey;
    if (cacheEhDistribuido) {
      AddIfMissing(missing, "CACHE_HOST", value.Host);
      if (isProduction)
        AddIfMissing(missing, "CACHE_PASSWORD", value.Password);

      var portaNaoEhPositiva = value.Port <= 0;
      var portaAcimaDoLimite = value.Port > 65535;
      if (portaNaoEhPositiva || portaAcimaDoLimite)
        invalid.Add("CACHE_PORT");
      if (value.Db < 0)
        invalid.Add("CACHE_DB");

      var connectTimeoutNaoEhPositivo = value.ConnectTimeoutMillis <= 0;
      var asyncTimeoutNaoEhPositivo = value.AsyncTimeoutMillis <= 0;
      if (connectTimeoutNaoEhPositivo || asyncTimeoutNaoEhPositivo)
        invalid.Add("CACHE_CONNECT_TIMEOUT_MILLIS/CACHE_ASYNC_TIMEOUT_MILLIS");

      var connectRetryEhNegativo = value.ConnectRetry < 0;
      var keepAliveNaoEhPositivo = value.KeepAliveSeconds <= 0;
      if (connectRetryEhNegativo || keepAliveNaoEhPositivo)
        invalid.Add("CACHE_CONNECT_RETRY/CACHE_KEEP_ALIVE_SECONDS");
    }

    var ttlBaseNaoEhPositivo = value.BaseTtlInSec <= 0;
    var ttlSessaoNaoEhPositivo = value.SessionTtlInSec <= 0;
    if (ttlBaseNaoEhPositivo || ttlSessaoNaoEhPositivo)
      invalid.Add("CACHE_BASE_TTL_IN_SEC/CACHE_SESSION_TTL_IN_SEC");

    ThrowIfInvalid(nameof(CacheConfig), missing, invalid);
  }

  public static void ValidaHangfire(HangfireConfig value, CacheConfig cache, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    AddIfMissing(missing, "HANGFIRE_STORAGE_TYPE", value.StorageType);

    var storageEhMemory = value.StorageType.Equals("Memory", StringComparison.OrdinalIgnoreCase);
    var storageEhRedis = value.StorageType.Equals("Redis", StringComparison.OrdinalIgnoreCase);
    var storageEhValkey = value.StorageType.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
    var storageEhDistribuido = storageEhRedis || storageEhValkey;
    var storageEhSuportado = storageEhMemory || storageEhDistribuido;

    if (!string.IsNullOrWhiteSpace(value.StorageType) && !storageEhSuportado)
      invalid.Add("HANGFIRE_STORAGE_TYPE");

    if (isProduction && storageEhMemory)
      invalid.Add("HANGFIRE_STORAGE_TYPE");

    if (storageEhDistribuido) {
      var cacheEhRedis = cache.Type.Equals("Redis", StringComparison.OrdinalIgnoreCase);
      var cacheEhValkey = cache.Type.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
      var cacheForneceMultiplexer = cacheEhRedis || cacheEhValkey;

      if (!cacheForneceMultiplexer)
        invalid.Add("CACHE_TYPE/HANGFIRE_STORAGE_TYPE");

      if (value.RedisDb < 0)
        invalid.Add("HANGFIRE_REDIS_DB");

      AddIfMissing(missing, "HANGFIRE_REDIS_PREFIX", value.RedisPrefix);
    }

    ThrowIfInvalid(nameof(HangfireConfig), missing, invalid);
  }

  public static void ValidaDataProtection(
    DataProtectionConfig value,
    CacheConfig cache,
    bool isProduction
  ) {
    var missing = new List<string>();
    var invalid = new List<string>();

    AddIfMissing(missing, "DATA_PROTECTION_APPLICATION_NAME", value.ApplicationName);

    var cacheEhRedis = cache.Type.Equals("Redis", StringComparison.OrdinalIgnoreCase);
    var cacheEhValkey = cache.Type.Equals("Valkey", StringComparison.OrdinalIgnoreCase);
    var cacheEhDistribuido = cacheEhRedis || cacheEhValkey;

    if (isProduction && !cacheEhDistribuido)
      invalid.Add("CACHE_TYPE/DATA_PROTECTION");

    if (cacheEhDistribuido)
      AddIfMissing(missing, "DATA_PROTECTION_REDIS_KEY", value.RedisKey);

    ThrowIfInvalid(nameof(DataProtectionConfig), missing, invalid);
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

    var portaNaoEhPositiva = value.Port <= 0;
    var portaAcimaDoLimite = value.Port > 65535;
    if (portaNaoEhPositiva || portaAcimaDoLimite)
      invalid.Add("EMAIL_PORT");

    ThrowIfInvalid(nameof(Email), missing, invalid);
  }

  public static void ValidaCrypto(Crypto value, bool isProduction) {
    if (!isProduction) return;

    var missing = new List<string>();
    var invalid = new List<string>();
    AddIfMissing(missing, "CRYPTO_SECRET", value.Secret);

    var tamanhoEmBytes = Encoding.UTF8.GetByteCount(value.Secret);
    var tamanhoEh16Bytes = tamanhoEmBytes == 16;
    var tamanhoEh24Bytes = tamanhoEmBytes == 24;
    var tamanhoEh32Bytes = tamanhoEmBytes == 32;
    var tamanhoEhValido = tamanhoEh16Bytes || tamanhoEh24Bytes || tamanhoEh32Bytes;
    if (!tamanhoEhValido)
      invalid.Add("CRYPTO_SECRET");

    ThrowIfInvalid(nameof(Crypto), missing, invalid);
  }

  public static void ValidaFileManager(FileManager value, bool isProduction) {
    var missing = new List<string>();
    var invalid = new List<string>();

    if (isProduction)
      AddIfMissing(missing, "FILE_MANAGER_TYPE", value.Type);

    var temTipoFileManager = !string.IsNullOrWhiteSpace(value.Type);
    var tipoFileManagerEhSuportado = IsOneOf(value.Type, "Local", "Cloudinary");
    if (temTipoFileManager && !tipoFileManagerEhSuportado) {
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
    var naoTemConfiguracaoFaltando = missing.Count == 0;
    var naoTemConfiguracaoInvalida = invalid.Count == 0;
    if (naoTemConfiguracaoFaltando && naoTemConfiguracaoInvalida) return;

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
