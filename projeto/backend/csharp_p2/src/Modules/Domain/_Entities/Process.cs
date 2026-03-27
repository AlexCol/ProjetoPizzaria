using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("PROCESSES")]
public class Process : BaseEntityWithId {
  [Column("NAME")]
  public string Name { get; set; }
}

[EntityConfiguration]
public static class ProcessEntityConfiguration {
  public static void ConfigureProcess(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<Process>(entity => {
      entity.HasKey(p => p.Id);
      entity.Property(p => p.Name).IsRequired();
    });
  }
}
