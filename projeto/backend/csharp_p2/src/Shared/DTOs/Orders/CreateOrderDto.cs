using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class CreateOrderDto {
  [Required(ErrorMessage = "O número da mesa é obrigatório.")]
  public int TableNumber { get; set; }

  public string Name { get; set; }

  public List<CreateOrderItemsDto> OrderItems { get; set; }
}
