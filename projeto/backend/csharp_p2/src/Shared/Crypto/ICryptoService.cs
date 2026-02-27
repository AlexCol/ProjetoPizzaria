using System.Security.Cryptography;

namespace csharp_p2.src.Shared.Crypto;

public interface ICryptoService {
  public string ComputeHash(string password, HashAlgorithm hashAlgorithm);
  public T Decrypt<T>(string encryptedValue);
  public string Decrypt(string encryptedValue);
  public string Encrypt<T>(T data);
}
