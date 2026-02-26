using System.Security.Cryptography;

namespace csharp_p2.src.Infra.Crypto;

public class CryptoService : ICryptoService {

  private readonly string secretKey;
  public CryptoService(IConfiguration config) {
    secretKey = config["Cripto:Secret"];
  }

  public string ComputeHash(string password, HashAlgorithm hashAlgorithm) {
    byte[] inputBytes = Encoding.UTF8.GetBytes(password);
    byte[] hashedBytes = hashAlgorithm.ComputeHash(inputBytes);

    var builder = new StringBuilder();

    foreach (var item in hashedBytes) {
      builder.Append(item.ToString("x2"));
    }
    return builder.ToString();
  }

  public string Decrypt(string encryptedValue) {
    try {
      using (Aes aesAlg = Aes.Create()) {
        aesAlg.Key = Encoding.UTF8.GetBytes(secretKey);
        aesAlg.Mode = CipherMode.CBC;
        aesAlg.Padding = PaddingMode.PKCS7;

        byte[] iv = new byte[aesAlg.BlockSize / 8];
        Array.Copy(Encoding.UTF8.GetBytes(secretKey), iv, iv.Length);
        aesAlg.IV = iv;

        ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

        var UrlSafingValue = encryptedValue.Replace('-', '+').Replace('_', '/');
        using (MemoryStream msDecrypt = new MemoryStream(Convert.FromBase64String(UrlSafingValue)))
        using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
        using (StreamReader srDecrypt = new StreamReader(csDecrypt)) {
          var decryptedValue = srDecrypt.ReadToEnd();
          return decryptedValue;
        }
      }
    } catch {
      return null;
    }
  }

  public T Decrypt<T>(string encryptedValue) {
    return JsonSerializer.Deserialize<T>(Decrypt(encryptedValue));
  }

  public string Encrypt<T>(T data) {
    using (Aes aesAlg = Aes.Create()) {
      aesAlg.Key = Encoding.UTF8.GetBytes(secretKey);
      aesAlg.Mode = CipherMode.CBC;
      aesAlg.Padding = PaddingMode.PKCS7;

      byte[] iv = new byte[aesAlg.BlockSize / 8];
      Array.Copy(Encoding.UTF8.GetBytes(secretKey), iv, iv.Length);
      aesAlg.IV = iv;

      ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

      using (MemoryStream msEncrypt = new MemoryStream())
      using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write)) {
        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt)) {
          if (typeof(T) == typeof(string))
            swEncrypt.Write(data);
          else {
            string jsonData = JsonSerializer.Serialize(data);
            swEncrypt.Write(jsonData);
          }
        }

        byte[] encryptedBytes = msEncrypt.ToArray();
        var UrlSafingValue = Convert.ToBase64String(encryptedBytes).Replace('+', '-').Replace('/', '_');
        return UrlSafingValue;
      }
    }
  }
}
