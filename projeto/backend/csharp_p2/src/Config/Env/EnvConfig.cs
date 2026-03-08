using csharp_p2.src.Config.Builder;

namespace csharp_p2.src.Config;

//! variaveis carregadas aqui podem ser tanto do .env quanto do appsettings,
//! se a mesma variavel estiver nos dois, é considerada a do .env
[Injectable(typeof(EnvConfig), EServiceLifetimeType.Singleton)]
public class EnvConfig {
  public AdminUser AdminUser { get; private set; }
  public string Environment { get; private set; }
  public FrondEnd FrondEnd { get; private set; }
  public Database Database { get; private set; }
  public Cache Cache { get; private set; }
  public Email Email { get; private set; }
  public Crypto Crypto { get; private set; }

  public EnvConfig(IConfiguration config) {
    LoadVariables(config);
  }

  private void LoadVariables(IConfiguration config) {
    Environment = config["ASPNETCORE_ENVIRONMENT"] ?? "Development";

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

    Cache = new Cache(
      Type: config["CACHE_TYPE"] ?? "",
      Host: config["CACHE_HOST"] ?? "",
      Port: config["CACHE_PORT"] ?? "",
      Password: config["CACHE_PASSWORD"] ?? "",
      Db: config["CACHE_DB"] ?? "0",
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

public record Cache(
  string Type,
  string Host,
  string Port,
  string Password,
  string Db,
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
#endregion
