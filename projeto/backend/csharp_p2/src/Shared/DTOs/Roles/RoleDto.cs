using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class RoleDto {
  [Required(ErrorMessage = "Name is required.")]
  [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
  public string Name { get; set; }
}
