namespace Shared.Exceptions;

public class InvalidValueObjectError : Exception {
  public InvalidValueObjectError(string message) : base(message) {
  }

  public InvalidValueObjectError(string message, Exception innerException)
    : base(message, innerException) {
  }
}
