using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class UpdateProductDto {
  [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters.")]
  public string Name { get; set; }

  [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
  public decimal? Price { get; set; }

  [StringLength(500, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 500 characters.")]
  public string Description { get; set; }

  [Range(1, long.MaxValue, ErrorMessage = "CategoryId must be a positive number.")]
  public long? CategoryId { get; set; }

  [Range(0, 1, ErrorMessage = "Disabled must be 0 or 1.")]
  public int? Disabled { get; set; }
}
