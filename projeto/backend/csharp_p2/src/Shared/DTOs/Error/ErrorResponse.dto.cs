namespace csharp_p2.src.Shared.DTOs;

public class ErrorResponseDto {
  public ErrorResponseDto(string errorMessage) {
    var errors = errorMessage.Split(";");
    foreach (var error in errors) {
      Message.Add(error);
    }
  }

  public ErrorResponseDto(IEnumerable<string> errorMessages) {
    Message.AddRange(errorMessages);
  }

  public ErrorResponseDto(Exception exception) {
    Message.Add(exception.Message);
    var inner = exception.InnerException;
    while (inner != null) {
      Message.Add(inner.Message);
      inner = inner.InnerException;
    }
  }

  public List<string> Message { get; set; } = new List<string>();

  public override string ToString() {
    string error = "";
    foreach (var err in Message) {
      error += (error == "") ? err : $";{err}";
    }

    return error;
  }
}
