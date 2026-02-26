using csharp_p2.src.Infra.Database.builders;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Infra.Database;

public class OracleDBContext : BaseDBContext {
  public OracleDBContext(DbContextOptions<OracleDBContext> options) : base(options) { }
}
