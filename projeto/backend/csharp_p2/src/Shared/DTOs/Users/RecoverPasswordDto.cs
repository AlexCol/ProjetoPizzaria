using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class RecoverPasswordDto {
  [Required(ErrorMessage = "Password is required.")]
  [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
  [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
          ErrorMessage = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol.")]
  public string Password { get; set; }

  [Required(ErrorMessage = "Confirm password is required.")]
  [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
  [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
          ErrorMessage = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol.")]
  public string ConfirmPassword { get; set; }
}
