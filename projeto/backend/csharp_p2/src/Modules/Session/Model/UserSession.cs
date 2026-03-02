namespace csharp_p2.src.Modules.Session.Model;

public class UserSession {
  public UserSessionPayload Payload { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime ExpiresAt { get; set; }
}
