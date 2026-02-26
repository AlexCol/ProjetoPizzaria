using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Infra.Database;

public class PostgresDBContext : BaseDBContext {
  public PostgresDBContext(DbContextOptions<PostgresDBContext> options) : base(options) { }
}
