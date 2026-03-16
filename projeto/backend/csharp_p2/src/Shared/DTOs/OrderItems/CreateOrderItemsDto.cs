using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class CreateOrderItemsDto {
  [Required(ErrorMessage = "A quantidade do item é obrigatória.")]
  public int Amount { get; set; }

  [Required(ErrorMessage = "O ID do pedido é obrigatório.")]
  public long OrderId { get; set; }

  [Required(ErrorMessage = "O ID do produto é obrigatório.")]
  public long ProductId { get; set; }
}
