using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("ORDERS")]
public class Order : BaseEntityWithId {
  [Column("TABLE_NUMBER")]
  public int TableNumber { get; set; }

  [Column("STATUS")]
  public EOrderStatus Status { get; set; }

  [Column("NAME")]
  public string Name { get; set; }

  [Column("USER_ID")]
  public long UserId { get; set; }

  public List<OrderItem> OrderItems { get; set; }
}

public static class OrderEntityConfiguration {
  public static void ConfigureOrder(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Order>(entity => {
      entity.HasKey(o => o.Id);
      entity.Property(o => o.TableNumber).IsRequired();
      entity.Property(o => o.Status)
        .IsRequired()
        .HasConversion(status => ((char)(int)status).ToString(), value => (EOrderStatus)value[0])
        .HasColumnType("CHAR(1)")
        .HasDefaultValue(EOrderStatus.Draft);
      entity.Property(o => o.Name);
      entity.Property(o => o.UserId).IsRequired();
      entity.HasOne<User>() //? configurado assim pois não tenho prop de navegação (public User User { get; set; })
            .WithMany()
            .HasForeignKey(o => o.UserId);
    });
  }
}
