using csharp_p2.src.Modules.Session;

namespace csharp_p2.src.Shared.DTOs;

public class MobileLoginResponseDto {
  public UserSessionPayload UserSessionPayload { get; set; } = new();
  public string SessionToken { get; set; }
}
