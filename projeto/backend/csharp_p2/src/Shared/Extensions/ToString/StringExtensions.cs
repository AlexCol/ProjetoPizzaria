using System.Text.RegularExpressions;

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

  public static string ToKebabCase(this string input) {
    if (string.IsNullOrEmpty(input)) return input;

    // separa acrônimos (HTMLParser => HTML-Parser) e limites lower->Upper (myValue => my-Value)
    var s = Regex.Replace(input, "([A-Z]+)([A-Z][a-z])", "$1-$2");
    s = Regex.Replace(s, "([a-z0-9])([A-Z])", "$1-$2");
    s = s.Replace("_", "-").Replace(" ", "-");
    return s.ToLowerInvariant();
  }
}
