using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("ORDER_ITEMS")]
public class OrderItem : BaseEntityWithId {
  [Column("AMOUNT")]
  public int Amount { get; set; }

  [Column("ORDER_ID")]
  public long OrderId { get; set; }
  [ForeignKey("OrderId")]
  public Order Order { get; set; }

  [Column("PRODUCT_ID")]
  public long ProductId { get; set; }
  [ForeignKey("ProductId")]
  public Product Product { get; set; }
}

public static class OrderItemEntityConfiguration {
  public static void ConfigureOrderItem(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<OrderItem>(entity => {
      entity.HasKey(oi => oi.Id);
      entity.Property(oi => oi.Amount).IsRequired();
      entity.HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId);
      entity.HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId);
    });
  }
}
