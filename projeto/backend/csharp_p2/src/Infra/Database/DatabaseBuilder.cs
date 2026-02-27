using csharp_p2.src.Config;
using csharp_p2.src.Infra.Database.Enumerators;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  public static string Database { get; private set; } = "";

  public static void AddDatabase(WebApplicationBuilder builder) {
    var env = new EnvConfig(builder.Configuration);
    var enumValido = Enum.TryParse<EDataBaseType>(env.Database.Type, true, out var database) && Enum.IsDefined(database);

    if (!enumValido)
      throw new Exception("[DataBaseBuilder] - Database not defined!");

    Database = database.ToString();

    //se adicionar mais, lembrar de olhar o context, tem coisa especifica de banco lá tbm
    if (database == EDataBaseType.Oracle) {
      builder.AddOracle(env);
    } else if (database == EDataBaseType.Postgres) {
      builder.AddPostgres(env);
    } else
      throw new Exception($"[DataBaseBuilder] - Process for {database} not created!");
  }
}
