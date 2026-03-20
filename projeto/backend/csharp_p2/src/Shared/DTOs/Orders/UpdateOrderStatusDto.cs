using System.ComponentModel.DataAnnotations;
using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Shared.DTOs;

public class UpdateOrderStatusDto {
  [Required(ErrorMessage = "O status do pedido é obrigatório.")]
  [EnumDataType(typeof(EOrderStatus), ErrorMessage = "Status inválido. Os valores válidos são: Draft, Pending, Done.")]
  public EOrderStatus Status { get; set; }
}
