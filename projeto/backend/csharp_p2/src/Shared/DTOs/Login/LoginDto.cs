using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs.Login;

public class LoginDto {
  [Required(ErrorMessage = "Required field.")]
  [EmailAddress(ErrorMessage = "Email is not valid.")]
  public string Email { get; set; }

  [Required(ErrorMessage = "Required field.")]
  public string Password { get; set; }
}
