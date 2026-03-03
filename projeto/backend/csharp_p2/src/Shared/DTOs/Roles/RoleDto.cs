using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class RoleDto {
  [Required(ErrorMessage = "Description is required.")]
  [StringLength(100, ErrorMessage = "Description cannot exceed 100 characters.")]
  public string Description { get; set; }
}
