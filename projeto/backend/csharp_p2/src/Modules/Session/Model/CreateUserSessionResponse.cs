namespace csharp_p2.src.Modules.Session;

public class CreateUserSessionResponse {
  public string SessionToken { get; set; } = string.Empty;
  public UserSessionPayload UserSessionPayload { get; set; } = new();
}
