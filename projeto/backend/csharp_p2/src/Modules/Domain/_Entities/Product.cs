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

  [Column("STATUS")]
  public EProductStatus Status { get; set; }

  [Column("CATEGORY_ID")]
  public long CategoryId { get; set; }
  [ForeignKey("CategoryId")]
  public Category Category { get; set; }
}

[EntityConfiguration]
public static class ProductEntityConfiguration {
  public static void ConfigureProduct(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Product>(entity => {
      entity.HasKey(p => p.Id);
      entity.Property(p => p.Name).IsRequired();
      entity.Property(p => p.Price).HasPrecision(18, 2).IsRequired();
      entity.Property(p => p.Description).IsRequired();
      //entity.Property(p => p.Banner).IsRequired();
      entity.Property(p => p.Status)
        .IsRequired()
        .HasConversion(status => ((char)(int)status).ToString(), value => (EProductStatus)value[0])
        .HasColumnType("CHAR(1)")
        .HasDefaultValue(EProductStatus.Active);
      entity.HasOne(p => p.Category) //? configurado assim pois tenho prop de navegação (public Category Category { get; set; })
            .WithMany()
            .HasForeignKey(p => p.CategoryId);
    });
  }
}
