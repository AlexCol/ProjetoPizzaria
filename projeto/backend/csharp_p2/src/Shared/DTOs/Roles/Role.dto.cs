using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace csharp_p2.src.Shared.DTOs.Roles;

public class RoleDto {
  [Required(ErrorMessage = "Description is required.")]
  [NotNull]
  [StringLength(100, ErrorMessage = "Description cannot exceed 100 characters.")]
  public string Description { get; set; }
}
