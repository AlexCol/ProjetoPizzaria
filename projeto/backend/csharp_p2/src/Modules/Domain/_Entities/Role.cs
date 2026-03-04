using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("ROLES")]
public class Role : BaseEntityWithId {

  [Column("NAME")]
  public string Name { get; set; }
}

public static class RoleEntityConfiguration {
  public static void ConfigureRole(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Role>(entity => {
      entity.HasKey(r => r.Id);
      entity.Property(r => r.Name).IsRequired();
    });
  }
}
