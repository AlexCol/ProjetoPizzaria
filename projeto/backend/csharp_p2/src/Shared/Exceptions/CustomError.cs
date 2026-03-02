namespace Shared.Exceptions;

public class CustomError : Exception {
  public CustomError(string message) : base(message) {
  }

  public CustomError(string message, Exception innerException)
    : base(message, innerException) {
  }
}
