using csharp_p2.src.Config.builder.DI.Atributes;
using csharp_p2.src.Config.builder.DI.Enumerators;

namespace csharp_p2.src.Config;

[Injectable(typeof(EnvConfig), EServiceLifetimeType.Singleton)]
public class EnvConfig {
  public Database Database { get; private set; }
  public Redis Redis { get; private set; }
  public Crypto Crypto { get; private set; }

  public EnvConfig(IConfiguration config) {
    LoadVariables(config);
  }

  private void LoadVariables(IConfiguration config) {
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

    Redis = new Redis(
      Host: config["REDIS_HOST"] ?? "",
      Port: config["REDIS_PORT"] ?? "",
      Password: config["REDIS_PASSWORD"] ?? "",
      Db: config["REDIS_DB"] ?? "0"
    );

    Crypto = new Crypto(
      Secret: config["CRYPTO_SECRET"] ?? ""
    );
  }
}

/************************************************************************************/
#region Records
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

public record Redis(
  string Host,
  string Port,
  string Password,
  string Db
);

public record Crypto(
  string Secret
);
#endregion
