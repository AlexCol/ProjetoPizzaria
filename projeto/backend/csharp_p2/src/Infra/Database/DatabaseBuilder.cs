using csharp_p2.src.Infra.Database.enumerators;

namespace csharp_p2.src.Infra.Database;

public static partial class DataBaseBuilder {
  public static string Database { get; private set; } = "";

  public static void AddDatabase(WebApplicationBuilder builder) {
    var confDatabase = builder.Configuration["Database"];
    var enumValido = Enum.TryParse<EDataBaseType>(confDatabase, true, out var database) && Enum.IsDefined(database);

    if (!enumValido)
      throw new Exception("[DataBaseBuilder] - Database not defined!");

    Database = database.ToString();

    //se adicionar mais, lembrar de olhar o context, tem coisa especifica de banco lá tbm
    if (database == EDataBaseType.Oracle) {
      builder.AddOracle();
    } else if (database == EDataBaseType.Postgres) {
      builder.AddPostgres();
    } else
      throw new Exception($"[DataBaseBuilder] - Process for {database} not created!");
  }
}
