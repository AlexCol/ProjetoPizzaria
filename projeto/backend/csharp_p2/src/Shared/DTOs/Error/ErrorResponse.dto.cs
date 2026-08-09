namespace csharp_p2.src.Shared.DTOs;

public class ErrorResponseDto {
  public ErrorResponseDto(string errorMessage, string traceId = null) {
    TraceId = traceId;
    var errors = errorMessage.Split(";");
    foreach (var error in errors) {
      this.Message.Add(error);
    }
  }

  public ErrorResponseDto(IEnumerable<string> errorMessages) {
    Message.AddRange(errorMessages);
  }

  public List<string> Message { get; set; } = [];
  public string TraceId { get; set; }

  public override string ToString() {
    string error = "";
    foreach (var err in Message) {
      error += (error == "") ? err : $";{err}";
    }

    return error;
  }
}
