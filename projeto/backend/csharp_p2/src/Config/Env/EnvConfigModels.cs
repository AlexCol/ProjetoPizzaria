namespace csharp_p2.src.Config;

public record FrondEnd(string Url);

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

public record HangfireConfig(
  string StorageType,
  int RedisDb,
  string RedisPrefix
);

public record DataProtectionConfig(
  string ApplicationName,
  string RedisKey
);

public record Email(
  string Host,
  int Port,
  string User,
  string Password,
  bool Secure
);

public record Crypto(string Secret);

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

public record HostFilteringConfig(string[] AllowedHosts);
