using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csharp_p2.src.Modules.Entities;

public abstract class BaseEntityWithId : BaseEntity {
  [Key]
  [Column("ID")]
  //[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public long Id { get; set; }
}
