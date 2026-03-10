using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("PRODUCTS")]
public class Product : BaseEntityWithId {
  [Column("NAME")]
  public string Name { get; set; }

  [Column("PRICE")]
  public decimal Price { get; set; }

  [Column("DESCRIPTION")]
  public string Description { get; set; }

  [Column("BANNER")]
  public string Banner { get; set; }

  [Column("DISABLED")]
  public int Disabled { get; set; }

  [Column("CATEGORY_ID")]
  public long CategoryId { get; set; }
  [ForeignKey("CategoryId")]
  public Category Category { get; set; }
}

public static class ProductEntityConfiguration {
  public static void ConfigureProduct(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Product>(entity => {
      entity.HasKey(p => p.Id);
      entity.Property(p => p.Name).IsRequired();
      entity.Property(p => p.Price).HasPrecision(18, 2).IsRequired();
      entity.Property(p => p.Description).IsRequired();
      //entity.Property(p => p.Banner).IsRequired();
      entity.Property(p => p.Disabled).IsRequired();
      entity.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);
    });
  }
}
