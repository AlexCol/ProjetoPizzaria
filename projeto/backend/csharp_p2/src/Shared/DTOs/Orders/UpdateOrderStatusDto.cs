using System.ComponentModel.DataAnnotations;
using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Shared.DTOs;

public class UpdateOrderStatusDto {
  [Required(ErrorMessage = "O status do pedido é obrigatório.")]
  public EOrderStatus Status { get; set; }
}
