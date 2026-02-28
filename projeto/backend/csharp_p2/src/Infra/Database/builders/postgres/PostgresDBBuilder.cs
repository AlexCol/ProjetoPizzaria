using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  private static void AddPostgres(this WebApplicationBuilder builder, EnvConfig env) {
    var database = env.Database;
    var connectionStringBuilder = new NpgsqlConnectionStringBuilder {
      Host = database.Host,
      Port = int.Parse(database.Port),
      Database = database.Name,
      Username = database.User,
      Password = database.Password,
      MinPoolSize = database.MinPool,
      MaxPoolSize = database.MaxPool,
      Timeout = Math.Max(1, database.AcquireTimeoutMillis / 1000),
      ConnectionIdleLifetime = Math.Max(1, database.IdleTimeoutMillis / 1000)
    };

    var connectionString = connectionStringBuilder.ConnectionString;
    builder.Services.AddDbContext<PostgresDBContext>(options =>
        options.UseNpgsql(connectionString));
    builder.Services.AddScoped<BaseDBContext>(sp => sp.GetRequiredService<PostgresDBContext>());
  }
}
