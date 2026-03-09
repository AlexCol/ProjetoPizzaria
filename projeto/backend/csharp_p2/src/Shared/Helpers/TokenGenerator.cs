using System.Security.Cryptography;

namespace csharp_p2.src.Shared.Helpers;

public static class TokenGenerator {
  public static string GenerateToken(int size = 32) {
    var randomBytes = new byte[size];
    using (var rng = RandomNumberGenerator.Create()) {
      rng.GetBytes(randomBytes);
    }
    return Convert.ToHexString(randomBytes).ToLower();
  }
}
