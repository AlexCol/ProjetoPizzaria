using csharp_p2.src.Config;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  private static void AddOracle(this WebApplicationBuilder builder, EnvConfig env) {
    // var conectionString = builder.Configuration["ConnectionStrings:Oracle"];
    // builder.Services.AddDbContext<OracleDbContext>(options => {
    //   options.UseOracle(conectionString);
    // });

    //   builder.Services.AddDbContext<OracleDBContext>(options =>
    //   options.UseOracle(connectionString));
    // builder.Services.AddScoped<BaseDBContext>(sp => sp.GetRequiredService<OracleDBContext>());
  }
}
