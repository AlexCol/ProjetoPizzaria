using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  private static void AddOracle(this WebApplicationBuilder builder, EnvConfig env) {
    var database = env.Database;
    var connectionStringBuilder = new OracleConnectionStringBuilder {
      DataSource = $"{database.Host}:{database.Port}/{database.Name}",
      UserID = database.User,
      Password = database.Password,
      MinPoolSize = database.MinPool,
      MaxPoolSize = database.MaxPool,
      ConnectionTimeout = Math.Max(1, database.AcquireTimeoutMillis / 1000),
      IncrPoolSize = 5, // Incremento de pool para conexões adicionais
      DecrPoolSize = 5, // Decremento de pool para conexões ociosas
    };

    builder.Services.AddDbContext<OracleDBContext>(options => {
      options.UseOracle(connectionStringBuilder.ConnectionString);
    });
    builder.Services.AddScoped<BaseDBContext>(sp => sp.GetRequiredService<OracleDBContext>());
  }
}
