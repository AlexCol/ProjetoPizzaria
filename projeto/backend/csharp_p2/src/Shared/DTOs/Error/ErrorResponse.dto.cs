namespace csharp_p2.src.Shared.Responses;

public class ErrorResponseDto {
  public ErrorResponseDto(string errorMessage) {
    var errors = errorMessage.Split(";");
    foreach (var error in errors) {
      ErrorMessage.Add(error);
    }
  }

  public ErrorResponseDto(IEnumerable<string> errorMessages) {
    ErrorMessage.AddRange(errorMessages);
  }

  public ErrorResponseDto(Exception exception) {
    ErrorMessage.Add(exception.Message);
    var inner = exception.InnerException;
    while (inner != null) {
      ErrorMessage.Add(inner.Message);
      inner = inner.InnerException;
    }
  }

  public List<string> ErrorMessage { get; set; } = new List<string>();

  public override string ToString() {
    string error = "";
    foreach (var err in ErrorMessage) {
      error += (error == "") ? err : $";{err}";
    }

    return error;
  }
}
