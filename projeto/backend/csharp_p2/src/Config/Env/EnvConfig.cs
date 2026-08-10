using csharp_p2.src.Config.Builder;

namespace csharp_p2.src.Config;

//! variaveis carregadas aqui podem ser tanto do .env quanto do appsettings,
//! se a mesma variavel estiver nos dois, é considerada a do .env
//[Injectable(typeof(EnvConfig), EServiceLifetimeType.Singleton)] //! ¹Motivo remoção abaixo

[IgnoreInjection]
public class EnvConfig {
  public AdminUser AdminUser { get; private set; }
  public string Environment { get; private set; }
  public bool IsDevelopment { get; private set; }
  public bool IsProduction { get; private set; }
  public FrondEnd FrondEnd { get; private set; }
  public Database Database { get; private set; }
  public CacheConfig Cache { get; private set; }
  public Email Email { get; private set; }
  public Crypto Crypto { get; private set; }
  public FileManager FileManager { get; private set; }
  public RateLimit RateLimit { get; private set; }
  public ForwardedHeadersConfig ForwardedHeaders { get; private set; }
  public HostFilteringConfig HostFiltering { get; private set; }

  public EnvConfig(
    IConfiguration config,
    IHostEnvironment hostEnvironment
  ) {
    LoadVariables(config);
    Environment = hostEnvironment.EnvironmentName;
    IsDevelopment = hostEnvironment.IsDevelopment();
    IsProduction = hostEnvironment.IsProduction();
  }

  private void LoadVariables(IConfiguration config) {
    FrondEnd = new FrondEnd(
      Url: config["FRONTEND_URL"] ?? ""
    );

    AdminUser = new AdminUser(
      Email: config["ADMIN_EMAIL"] ?? "",
      Password: config["ADMIN_PASSWORD"] ?? ""
    );

    Database = new Database(
      Type: config["DB_TYPE"] ?? "",
      Host: config["DB_HOST"] ?? "",
      Port: config["DB_PORT"] ?? "",
      User: config["DB_USER"] ?? "",
      Password: config["DB_PASS"] ?? "",
      Name: config["DB_NAME"] ?? "",
      MinPool: int.Parse(config["DB_MIN_POOL"] ?? "2"),
      MaxPool: int.Parse(config["DB_MAX_POOL"] ?? "10"),
      AcquireTimeoutMillis: int.Parse(config["DB_ACQUIRE_TIMEOUT_MILLIS"] ?? "30000"),
      IdleTimeoutMillis: int.Parse(config["DB_IDLE_TIMEOUT_MILLIS"] ?? "300000")
    );

    Cache = new CacheConfig(
      Type: config["CACHE_TYPE"] ?? "",
      Host: config["CACHE_HOST"] ?? "",
      Port: int.TryParse(config["CACHE_PORT"], out var cachePort) ? cachePort : 6379,
      User: config["CACHE_USER"] ?? "",
      Password: config["CACHE_PASSWORD"] ?? "",
      Db: int.TryParse(config["CACHE_DB"], out var cacheDb) ? cacheDb : 0,
      Ssl: bool.TryParse(config["CACHE_SSL"], out var cacheSsl) && cacheSsl,
      SslHost: config["CACHE_SSL_HOST"] ?? "",
      ConnectTimeoutMillis: int.TryParse(config["CACHE_CONNECT_TIMEOUT_MILLIS"], out var cacheConnectTimeout) ? cacheConnectTimeout : 5000,
      AsyncTimeoutMillis: int.TryParse(config["CACHE_ASYNC_TIMEOUT_MILLIS"], out var cacheAsyncTimeout) ? cacheAsyncTimeout : 5000,
      ConnectRetry: int.TryParse(config["CACHE_CONNECT_RETRY"], out var cacheConnectRetry) ? cacheConnectRetry : 3,
      KeepAliveSeconds: int.TryParse(config["CACHE_KEEP_ALIVE_SECONDS"], out var cacheKeepAlive) ? cacheKeepAlive : 60,
      BaseTtlInSec: int.Parse(config["CACHE_BASE_TTL_IN_SEC"] ?? "604800"),
      SessionTtlInSec: int.Parse(config["CACHE_SESSION_TTL_IN_SEC"] ?? "604800")
    );

    Email = new Email(
      Host: config["EMAIL_HOST"] ?? "",
      Port: int.Parse(config["EMAIL_PORT"] ?? "587"),
      User: config["EMAIL_USER"] ?? "",
      Password: config["EMAIL_PASS"] ?? "",
      Secure: bool.Parse(config["EMAIL_SECURE"] ?? "true")
    );

    Crypto = new Crypto(
      Secret: config["CRYPTO_SECRET"] ?? ""
    );

    FileManager = new FileManager(
      Type: config["FILE_MANAGER_TYPE"] ?? "",
      BasePath: config["FILE_MANAGER_BASE_PATH"] ?? "",
      Endpoint: config["FILE_MANAGER_ENDPOINT"] ?? "",
      Region: config["FILE_MANAGER_REGION"] ?? "",
      Bucket: config["FILE_MANAGER_BUCKET"] ?? "",
      AccessKey: config["FILE_MANAGER_ACCESS_KEY"] ?? "",
      SecretKey: config["FILE_MANAGER_SECRET_KEY"] ?? "",
      Folder: config["FILE_MANAGER_FOLDER"] ?? "",
      MaxBytes: long.TryParse(config["FILEX_MAX_BYTES"], out var maxBytes) ? maxBytes : 0,
      AllowedExtensions: (config["FILEX_ALLOWED_EXTENSIONS"] ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries)
    );

    //pra ter uma variação, Ratelimit vem do appsettings.json, não do .env
    //defaults com valore negativo, para o o caso de faltar no json, dar erro
    RateLimit = new RateLimit(
      Login: new RateLimitConfig(
        PermitLimit: int.Parse(config["RateLimiting:Login:PermitLimit"] ?? "-1"),
        WindowSeconds: int.Parse(config["RateLimiting:Login:WindowSeconds"] ?? "-1")
      ),
      EmailDelivery: new RateLimitConfig(
        PermitLimit: int.Parse(config["RateLimiting:EmailDelivery:PermitLimit"] ?? "-1"),
        WindowSeconds: int.Parse(config["RateLimiting:EmailDelivery:WindowSeconds"] ?? "-1")
      ),
      TokenOperation: new RateLimitConfig(
        PermitLimit: int.Parse(config["RateLimiting:TokenOperation:PermitLimit"] ?? "-1"),
        WindowSeconds: int.Parse(config["RateLimiting:TokenOperation:WindowSeconds"] ?? "-1")
      ),
      Default: new RateLimitConfig(
        PermitLimit: int.Parse(config["RateLimiting:Default:PermitLimit"] ?? "-1"),
        WindowSeconds: int.Parse(config["RateLimiting:Default:WindowSeconds"] ?? "-1")
      )
    );

    ForwardedHeaders = new ForwardedHeadersConfig(
      TrustedProxies: (config["TRUSTED_PROXIES"] ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
      ForwardLimit: int.TryParse(config["FORWARDED_HEADERS_LIMIT"], out var forwardLimit) ? forwardLimit : 1
    );

    HostFiltering = new HostFilteringConfig(
      AllowedHosts: (config["ALLOWED_HOSTS"] ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    );
  }
}

/************************************************************************************/
#region Records
public record FrondEnd(
  string Url
);

public record AdminUser(
  string Email,
  string Password
);
public record Database(
  string Type,
  string Host,
  string Port,
  string User,
  string Password,
  string Name,
  int MinPool,
  int MaxPool,
  int AcquireTimeoutMillis,
  int IdleTimeoutMillis
);

public record CacheConfig(
  string Type,
  string Host,
  int Port,
  string User,
  string Password,
  int Db,
  bool Ssl,
  string SslHost,
  int ConnectTimeoutMillis,
  int AsyncTimeoutMillis,
  int ConnectRetry,
  int KeepAliveSeconds,
  int BaseTtlInSec,
  int SessionTtlInSec
);

public record Email(
  string Host,
  int Port,
  string User,
  string Password,
  bool Secure
);

public record Crypto(
  string Secret
);

public record FileManager(
  string Type,
  string BasePath,
  string Endpoint,
  string Region,
  string Bucket,
  string AccessKey,
  string SecretKey,
  string Folder,
  long MaxBytes,
  string[] AllowedExtensions
);

public record RateLimit(
  RateLimitConfig Login,
  RateLimitConfig EmailDelivery,
  RateLimitConfig TokenOperation,
  RateLimitConfig Default
);
public record RateLimitConfig(
  int PermitLimit,
  int WindowSeconds
);

public record ForwardedHeadersConfig(
  string[] TrustedProxies,
  int ForwardLimit
);

public record HostFilteringConfig(
  string[] AllowedHosts
);
#endregion

/*
removido o injectable, pois ou registrar manualmente em BuilderConfig,
crio a instancia manualmente para usar no builder, e registro a mesma
instancia manualmente no services, assim a mesma instancia é usada em toda a aplicação,
e não uma nova cópia singleton...
mesmo sendo tecnicamente os mesmos dados, a instancia é diferente...
*/
