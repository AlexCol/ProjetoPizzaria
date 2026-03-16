using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class UpsertOrderItemsDto {
  [Required(ErrorMessage = "A quantidade do item é obrigatória.")]
  public int Amount { get; set; }

  [Required(ErrorMessage = "O ID do produto é obrigatório.")]
  public long ProductId { get; set; }
}
