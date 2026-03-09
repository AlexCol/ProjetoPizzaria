using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("ORDERS")]
public class Order : BaseEntityWithId {
  [Column("TABLE_NUMBER")]
  public int TableNumber { get; set; }

  [Column("STATUS")]
  public int Status { get; set; }

  [Column("NAME")]
  public string Name { get; set; }
}

public static class OrderEntityConfiguration {
  public static void ConfigureOrder(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Order>(entity => {
      entity.HasKey(o => o.Id);
      entity.Property(o => o.TableNumber).IsRequired();
      entity.Property(o => o.Status).IsRequired();
      entity.Property(o => o.Name);
    });
  }
}
