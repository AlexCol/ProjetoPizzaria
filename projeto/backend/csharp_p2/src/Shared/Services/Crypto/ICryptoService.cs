using System.Security.Cryptography;

namespace csharp_p2.src.Shared.Services.Crypto;

public interface ICryptoService {
  public string ComputeHash(string password, HashAlgorithm hashAlgorithm);
  public T Decrypt<T>(string encryptedValue, string secretKey = null);
  public string Decrypt(string encryptedValue, string secretKey = null);
  public string Encrypt<T>(T data, string secretKey = null);
}
