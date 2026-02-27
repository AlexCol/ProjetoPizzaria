namespace csharp_p2.src.Shared.Extensions;

public static class StringExtensions {
  public static bool HasUpperCase(this string str) {
    if (str == null) return false;
    return str.Any(char.IsUpper);
  }

  public static bool HasLowerCase(this string str) {
    if (str == null) return false;
    return str.Any(char.IsLower);
  }

  public static bool HasSpecialCharacter(this string str) {
    if (str == null) return false;
    return str.Any(ch => !char.IsLetterOrDigit(ch));
  }

  public static bool HasNumber(this string str) {
    if (str == null) return false;
    return str.Any(char.IsDigit);
  }

  public static bool IsNullOrEmpty(this string str) {
    return string.IsNullOrEmpty(str);
  }
}
