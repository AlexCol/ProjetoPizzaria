using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace csharp_p2.src.Modules.Domain;

[Table("TOKEN_CONTROL")]
public class TokenControl {
  [Column("ID_PROCESS")]
  public long IdProcess { get; set; }

  [Column("ID_OBJECT")]
  public long IdObject { get; set; }

  [Column("TOKEN")]
  public string Token { get; set; }

  [Column("CREATED_AT")]
  public DateTime CreatedAt { get; set; }

  [Column("EXPIRES_AT")]
  public DateTime? ExpiresAt { get; set; }
}

[EntityConfiguration]
public static class TokenControlEntityConfiguration {
  public static void ConfigureTokenControl(this ModelBuilder modelBuilder) {
    modelBuilder.Entity<TokenControl>(entity => {
      entity.HasKey(tc => new { tc.IdProcess, tc.IdObject });

      entity.Property(tc => tc.IdProcess).IsRequired();
      entity.Property(tc => tc.IdObject).IsRequired();
      entity.Property(tc => tc.Token).IsRequired();
      entity.Property(tc => tc.CreatedAt).IsRequired();

      entity.HasOne<Process>()
        .WithMany()
        .HasForeignKey(tc => tc.IdProcess)
        .OnDelete(DeleteBehavior.Cascade);
    });
  }
}
