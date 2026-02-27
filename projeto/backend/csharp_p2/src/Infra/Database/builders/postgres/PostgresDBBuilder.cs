using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  private static void AddPostgres(this WebApplicationBuilder builder, EnvConfig env) {
    var database = env.Database;
    var connectionString = $"Host={database.Host};Port={database.Port};Database={database.Name};Username={database.User};Password={database.Password}";
    builder.Services.AddDbContext<PostgresDBContext>(options =>
        options.UseNpgsql(connectionString));
    builder.Services.AddScoped<BaseDBContext>(sp => sp.GetRequiredService<PostgresDBContext>());
  }
}
