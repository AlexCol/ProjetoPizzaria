using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using csharp_p2.src.Shared.VOs;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("USERS")]
public class User : BaseEntityWithId {

  [Column("EMAIL")]
  public EmailVO Email { get; set; }

  [Column("PASSWORD")]
  public string Password { get; set; }

  [Column("NAME")]
  public string Name { get; set; }

  [NotNull]
  [Column("STATUS")]
  public EUserStatus Status { get; set; }

  [NotNull]
  [Column("ROLE_ID")]
  public long RoleId { get; set; }

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

      entity.HasIndex(u => u.Email).IsUnique();
      entity.Property(u => u.Password).IsRequired();
      entity.Property(u => u.Name).IsRequired();
      entity.Property(u => u.Status)
        .IsRequired()
        .HasConversion(status => ((char)(int)status).ToString(), value => (EUserStatus)value[0])
        .HasColumnType("CHAR(1)");
      entity.Property(u => u.RoleId).IsRequired();

      entity.HasOne(u => u.Role) //? configurado assim pois tenho prop de navegação (public Role Role { get; set; })
        .WithMany()
        .HasForeignKey(u => u.RoleId)
        .OnDelete(DeleteBehavior.Restrict);
    });
  }
}
