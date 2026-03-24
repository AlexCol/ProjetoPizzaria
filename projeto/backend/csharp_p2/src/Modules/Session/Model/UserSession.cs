using csharp_p2.src.Shared.DTOs;

namespace csharp_p2.src.Modules.Session;

public class UserSession {
  public UserSessionPayload Payload { get; set; }
  public SessionOptionsDto Options { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime ExpiresAt { get; set; }
}
