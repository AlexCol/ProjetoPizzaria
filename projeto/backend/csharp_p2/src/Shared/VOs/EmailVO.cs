using System.Text.RegularExpressions;
using csharp_p2.src.Shared.Exceptions;

namespace csharp_p2.src.Shared.VOs;

public class EmailVO : BaseVO {
  public string Value { get; private set; } = string.Empty;

  protected EmailVO() { }

  public EmailVO(string email) {
    if (string.IsNullOrEmpty(email)) {
      throw new CustomError("Email inválido.");
    }

    string normalized = email.Trim().ToLower();

    if (!IsValid(normalized)) {
      throw new CustomError("Email inválido.");
    }

    Value = normalized;
  }

  /************************************************************/
  /* Exibição / Integração                                   */
  /************************************************************/
  public override string ToString() {
    return GetValue();
  }

  public override string GetValue(params object[] @params) {
    return Value;
  }

  /************************************************************/
  /* Comparação                                               */
  /************************************************************/
  public override bool Equals(object? obj) {
    if (ReferenceEquals(this, obj))
      return true;
    if (obj is not EmailVO other)
      return false;
    return Value == other.Value;
  }

  public override int GetHashCode() {
    return Value.GetHashCode();
  }

  /************************************************************/
  /* Validação                                                */
  /************************************************************/
  private static bool IsValid(string email) {
    string emailRegex = @"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$";
    return Regex.IsMatch(email, emailRegex);
  }

  // exemplos que esse regex permite
  // válidos:
  /// john.doe@gmail.com
  /// john+newsletter@gmail.com
  /// user_name@empresa.com
  /// billing+2024@empresa.com.br
  /// contato@sub.dominio.co.uk
  /// a.b-c_d+e@dominio-legal.io
  //
  // inválidos:
  /// john@gmail                 // sem TLD
  /// john@.com                  // domínio inválido
  /// john@domain.c              // TLD muito curto
  /// john@@gmail.com            // dois @
  /// john gmail@gmail.com       // espaço
  /// "john.doe"@gmail.com       // aspas (RFC válido, mas intencionalmente bloqueado)
  /// john@[192.168.0.1]         // IP literal (bloqueado)
}
