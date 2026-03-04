using System.ComponentModel.DataAnnotations.Schema;

namespace csharp_p2.src.Modules.Domain;

public abstract class BaseEntity {
  [Column("CREATED_AT")]
  public DateTime CreatedAt { get; set; }

  [Column("UPDATED_AT")]
  public DateTime UpdatedAt { get; set; }
}
