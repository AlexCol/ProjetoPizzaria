using csharp_p2.src.Config.Builder;

namespace csharp_p2.src.Config;

//! Variáveis carregadas aqui podem vir tanto do .env quanto do appsettings.
//! Quando a mesma variável existir nos dois, será considerado o valor do .env.
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
    Environment = hostEnvironment.EnvironmentName;
    IsDevelopment = hostEnvironment.IsDevelopment();
    IsProduction = hostEnvironment.IsProduction();

    LoadVariables(config);
  }

  private void LoadVariables(IConfiguration config) {
    FrondEnd = new FrondEnd(
      Url: config["FRONTEND_URL"] ?? ""
    );
    ValidadorEnvConfig.ValidaFrondEnd(FrondEnd, IsProduction);

    AdminUser = new AdminUser(
      Email: config["ADMIN_EMAIL"] ?? "",
      Password: config["ADMIN_PASSWORD"] ?? ""
    );
    ValidadorEnvConfig.ValidaAdminUser(AdminUser, IsProduction);

    Database = new Database(
      Type: config["DB_TYPE"] ?? "",
      Host: config["DB_HOST"] ?? "",
      Port: config["DB_PORT"] ?? "",
      User: config["DB_USER"] ?? "",
      Password: config["DB_PASS"] ?? "",
      Name: config["DB_NAME"] ?? "",
      MinPool: LeitorEnvConfig.LeInt(config, "DB_MIN_POOL", 2),
      MaxPool: LeitorEnvConfig.LeInt(config, "DB_MAX_POOL", 10),
      AcquireTimeoutMillis: LeitorEnvConfig.LeInt(config, "DB_ACQUIRE_TIMEOUT_MILLIS", 30000),
      IdleTimeoutMillis: LeitorEnvConfig.LeInt(config, "DB_IDLE_TIMEOUT_MILLIS", 300000)
    );
    ValidadorEnvConfig.ValidaDatabase(Database, IsProduction);

    Cache = new CacheConfig(
      Type: config["CACHE_TYPE"] ?? "",
      Host: config["CACHE_HOST"] ?? "",
      Port: LeitorEnvConfig.LeInt(config, "CACHE_PORT", 6379),
      User: config["CACHE_USER"] ?? "",
      Password: config["CACHE_PASSWORD"] ?? "",
      Db: LeitorEnvConfig.LeInt(config, "CACHE_DB", 0),
      Ssl: LeitorEnvConfig.LeBool(config, "CACHE_SSL", false),
      SslHost: config["CACHE_SSL_HOST"] ?? "",
      ConnectTimeoutMillis: LeitorEnvConfig.LeInt(config, "CACHE_CONNECT_TIMEOUT_MILLIS", 5000),
      AsyncTimeoutMillis: LeitorEnvConfig.LeInt(config, "CACHE_ASYNC_TIMEOUT_MILLIS", 5000),
      ConnectRetry: LeitorEnvConfig.LeInt(config, "CACHE_CONNECT_RETRY", 3),
      KeepAliveSeconds: LeitorEnvConfig.LeInt(config, "CACHE_KEEP_ALIVE_SECONDS", 60),
      BaseTtlInSec: LeitorEnvConfig.LeInt(config, "CACHE_BASE_TTL_IN_SEC", 604800),
      SessionTtlInSec: LeitorEnvConfig.LeInt(config, "CACHE_SESSION_TTL_IN_SEC", 604800)
    );
    ValidadorEnvConfig.ValidaCache(Cache, IsProduction);

    Email = new Email(
      Host: config["EMAIL_HOST"] ?? "",
      Port: LeitorEnvConfig.LeInt(config, "EMAIL_PORT", 587),
      User: config["EMAIL_USER"] ?? "",
      Password: config["EMAIL_PASS"] ?? "",
      Secure: LeitorEnvConfig.LeBool(config, "EMAIL_SECURE", true)
    );
    ValidadorEnvConfig.ValidaEmail(Email, IsProduction);

    Crypto = new Crypto(
      Secret: config["CRYPTO_SECRET"] ?? ""
    );
    ValidadorEnvConfig.ValidaCrypto(Crypto, IsProduction);

    FileManager = new FileManager(
      Type: config["FILE_MANAGER_TYPE"] ?? "",
      BasePath: config["FILE_MANAGER_BASE_PATH"] ?? "",
      Endpoint: config["FILE_MANAGER_ENDPOINT"] ?? "",
      Region: config["FILE_MANAGER_REGION"] ?? "",
      Bucket: config["FILE_MANAGER_BUCKET"] ?? "",
      AccessKey: config["FILE_MANAGER_ACCESS_KEY"] ?? "",
      SecretKey: config["FILE_MANAGER_SECRET_KEY"] ?? "",
      Folder: config["FILE_MANAGER_FOLDER"] ?? "",
      MaxBytes: LeitorEnvConfig.LeLong(config, "FILEX_MAX_BYTES", 0),
      AllowedExtensions: (config["FILEX_ALLOWED_EXTENSIONS"] ?? "")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    );
    ValidadorEnvConfig.ValidaFileManager(FileManager, IsProduction);

    // Para ter uma variação, RateLimit vem do appsettings.json, não do .env.
    // Os defaults negativos fazem a inicialização falhar caso a configuração falte no JSON.
    RateLimit = new RateLimit(
      Login: new RateLimitConfig(
        PermitLimit: LeitorEnvConfig.LeInt(config, "RateLimiting:Login:PermitLimit", -1),
        WindowSeconds: LeitorEnvConfig.LeInt(config, "RateLimiting:Login:WindowSeconds", -1)
      ),
      EmailDelivery: new RateLimitConfig(
        PermitLimit: LeitorEnvConfig.LeInt(config, "RateLimiting:EmailDelivery:PermitLimit", -1),
        WindowSeconds: LeitorEnvConfig.LeInt(config, "RateLimiting:EmailDelivery:WindowSeconds", -1)
      ),
      TokenOperation: new RateLimitConfig(
        PermitLimit: LeitorEnvConfig.LeInt(config, "RateLimiting:TokenOperation:PermitLimit", -1),
        WindowSeconds: LeitorEnvConfig.LeInt(config, "RateLimiting:TokenOperation:WindowSeconds", -1)
      ),
      Default: new RateLimitConfig(
        PermitLimit: LeitorEnvConfig.LeInt(config, "RateLimiting:Default:PermitLimit", -1),
        WindowSeconds: LeitorEnvConfig.LeInt(config, "RateLimiting:Default:WindowSeconds", -1)
      )
    );
    ValidadorEnvConfig.ValidaRateLimit(RateLimit);

    ForwardedHeaders = new ForwardedHeadersConfig(
      TrustedProxies: (config["TRUSTED_PROXIES"] ?? "")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
      ForwardLimit: LeitorEnvConfig.LeInt(config, "FORWARDED_HEADERS_LIMIT", 1)
    );
    ValidadorEnvConfig.ValidaForwardedHeaders(ForwardedHeaders);

    HostFiltering = new HostFilteringConfig(
      AllowedHosts: (config["ALLOWED_HOSTS"] ?? "")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    );
    ValidadorEnvConfig.ValidaHostFiltering(HostFiltering, IsProduction);
  }
}

/*
Removido o Injectable, pois a instância é criada manualmente no BuilderConfig para
ser usada durante a montagem da aplicação e depois registrada no container. Assim,
a mesma instância é usada em toda a aplicação, em vez de outra cópia singleton.
*/
