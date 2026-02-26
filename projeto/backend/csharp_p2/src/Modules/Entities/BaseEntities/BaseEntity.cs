using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace csharp_p2.src.Modules.Entities;

public abstract class BaseEntity {
  [Column("CRIADO_EM")]
  public DateTime CriadoEm { get; set; }

  [Column("EDITADO_EM")]
  public DateTime EditadoEm { get; set; }
}
