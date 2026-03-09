using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class EmailDto {
  [Required(ErrorMessage = "Email is required.")]
  [EmailAddress(ErrorMessage = "Invalid email format.")]
  public string Email { get; set; }
}
