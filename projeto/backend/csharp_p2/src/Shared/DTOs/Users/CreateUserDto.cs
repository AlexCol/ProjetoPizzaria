using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs.Users;

public class CreateUserDto {
  [Required(ErrorMessage = "Required field.")]
  [EmailAddress(ErrorMessage = "Email is not valid.")]
  public string Email { get; set; } = null!;

  [Required(ErrorMessage = "Required field.")]
  [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
  [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
          ErrorMessage = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol.")]
  public string Password { get; set; } = null!;

  [Required(ErrorMessage = "Required field.")]
  [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
  [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
          ErrorMessage = "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol.")]
  public string ConfirmPassword { get; set; }

  [Required(ErrorMessage = "Required field.")]
  [StringLength(255, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 255 characters.")]
  public string Name { get; set; }

  [Required(ErrorMessage = "Required field.")]
  public long? RoleId { get; set; }
}
