using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("CATEGORIES")]
public class Category : BaseEntityWithId {
  [Column("NAME")]
  public string Name { get; set; }
}

public static class CategoriesEntityConfiguration {
  public static void ConfigureCategories(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Category>(entity => {
      entity.HasKey(c => c.Id);
      entity.Property(c => c.Name).IsRequired();
    });
  }
}
