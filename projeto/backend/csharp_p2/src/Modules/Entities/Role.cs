using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using csharp_p2.src.Shared.VOs;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Entities;

[Table("ROLES")]
public class Role : BaseEntityWithId {

  [NotNull] //utilizar esse e não required, pois com isso consigo suprimir a obrigatoriedade de vir no json (ver DependenciesBuilder)
  [Column("DESCRIPTION")]
  public string Description { get; set; }
}

public static class RoleEntityConfiguration {
  public static void ConfigureRole(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Role>(entity => {
      entity.HasKey(r => r.Id);
    });
  }
}
