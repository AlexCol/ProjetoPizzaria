namespace csharp_p2.src.Shared.Exceptions;

public class CustomError : Exception {
  public int Status { get; }

  public CustomError(string message, int status = 400) : base(message) {
    Status = status;
  }

  public CustomError(string message, Exception innerException)
    : base(message, innerException) {
  }
}
