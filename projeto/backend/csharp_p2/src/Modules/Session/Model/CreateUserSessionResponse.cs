namespace csharp_p2.src.Modules.Session.Model;

public class CreateUserSessionResponse {
  public string SessionToken { get; set; }
  public UserSessionPayload UserSessionPayload { get; set; }
}
