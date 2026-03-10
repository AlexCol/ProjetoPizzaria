using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class CreateProductDto {
  [Required]
  [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters.")]
  public string Name { get; set; }

  [Required]
  [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
  public decimal Price { get; set; }

  [Required]
  [StringLength(500, MinimumLength = 1, ErrorMessage = "Description must be between 1 and 500 characters.")]
  public string Description { get; set; }

  [Required]
  public byte Banner { get; set; }

  [Required]
  [Range(0, long.MaxValue, ErrorMessage = "CategoryId must be a non-negative number.")]
  public long CategoryId { get; set; }
}
