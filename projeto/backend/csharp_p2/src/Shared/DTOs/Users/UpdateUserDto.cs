using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class UpdateUserDto {
  [StringLength(255, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 255 characters.")]
  public string Name { get; set; }

  public long RoleId { get; set; }
}
