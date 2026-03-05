namespace csharp_p2.src.Shared.DTOs;

public class MessageDto {
  public string Message { get; set; }

  public MessageDto(string message) {
    Message = message;
  }
}
