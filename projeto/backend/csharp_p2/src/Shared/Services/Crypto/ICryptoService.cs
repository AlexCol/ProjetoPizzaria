namespace csharp_p2.src.Shared.Services.Crypto;

public interface ICryptoService {
  public string ComputeSha256Hash(string value);
  // public string ComputeHash(string value, HashAlgorithm hashAlgorithm = null);
  public T Decrypt<T>(string encryptedValue, string secretKey = null);
  public string Decrypt(string encryptedValue, string secretKey = null);
  public string Encrypt<T>(T data, string secretKey = null);
}
