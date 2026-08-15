using System.ComponentModel.DataAnnotations;

namespace csharp_p2.src.Shared.DTOs;

public class TokenDto {
  [Required(ErrorMessage = "Token is required.")]
  public string Token { get; set; } = string.Empty;
}
