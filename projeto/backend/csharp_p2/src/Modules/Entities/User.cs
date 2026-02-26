using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using csharp_p2.src.Shared.VOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace csharp_p2.src.Modules.Entities;

[Table("USUARIOS")]
public class User : BaseEntityWithId {

  [NotNull] //utilizar esse e não required, pois com isso consigo suprimir a obrigatoriedade de vir no json (ver DependenciesBuilder)
  [Column("EMAIL")]
  public EmailVO Email { get; set; }

  [NotNull] //utilizar esse e não required, pois com isso consigo suprimir a obrigatoriedade de vir no json (ver DependenciesBuilder)
  [Column("PASSWORD")]
  public string Password { get; set; }

  [NotNull]
  [Column("NAME")]
  public string Name { get; set; }

  [NotNull]
  [Column("ACTIVE")]
  public bool Active { get; set; }

  [NotNull]
  [Column("ROLE_ID")]
  public int RoleId { get; set; }

  [ForeignKey("RoleId")]
  public Role Role { get; set; }
}

public static class UserEntityConfiguration {
  public static void ConfigureUser(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<User>(entity => {
      entity.HasKey(u => u.Id);
      entity.Property(u => u.Email)
        .HasColumnName("EMAIL")
        .HasConversion(
          vo => vo.Value,
          value => new EmailVO(value)
        );

      entity.HasOne(u => u.Role)
        .WithMany()
        .HasForeignKey(u => u.RoleId)
        .OnDelete(DeleteBehavior.Restrict);
    });
  }
}
