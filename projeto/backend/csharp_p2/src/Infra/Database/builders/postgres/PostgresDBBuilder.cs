using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  private static void AddPostgres(this WebApplicationBuilder builder) {
    var connectionString = builder.Configuration["ConnectionStrings:Postgres"];
    builder.Services.AddDbContext<PostgresDBContext>(options =>
        options.UseNpgsql(connectionString));
    builder.Services.AddScoped<BaseDBContext>(sp => sp.GetRequiredService<PostgresDBContext>());
  }
}
