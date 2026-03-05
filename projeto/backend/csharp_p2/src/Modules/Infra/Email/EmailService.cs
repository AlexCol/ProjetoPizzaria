using System.Net;
using System.Net.Mail;
using csharp_p2.src.Config;
using csharp_p2.src.Modules.Domain;

namespace csharp_p2.src.Modules.Infra.Email;

public interface IEmailService {
  Task SendRegisterEmail(string token, User user);
  Task SendRecoverPasswordEmail(string token, string email);
}

public class EmailService : IEmailService {
  private readonly EnvConfig _env;
  public EmailService(EnvConfig env) {
    _env = env;
  }

  public async Task SendRegisterEmail(string token, User user) {
    var emailTo = user.Email.Value;
    var subject = "Ativação de cadastro site - Projetos Alexandre";

    var linkAtivaConta = _env.FrondEnd.Url + "/ativacao?token=<token>";
    linkAtivaConta = linkAtivaConta.Replace("<token>", token);
    var body = "";
    body += $"<h1>Bem vindo {EscapeString(user.Name)}!</h1>";
    body += $"<p>Seu cadastro foi realizado com sucesso. Para ativar sua conta, por favor clique no link abaixo.</p>";
    body += $"<a href='{linkAtivaConta}'>Clique aqui para ativar sua conta.</a>";

    await sendEmail(emailTo, subject, body);
  }

  public async Task SendRecoverPasswordEmail(string token, string email) {
    var emailTo = email;
    var subject = "Recuperação de senha - Projetos Alexandre";

    var linkRecuperaConta = _env.FrondEnd.Url + "/recuperar-senha?token=<token>";
    linkRecuperaConta = linkRecuperaConta.Replace("<token>", token);

    var body = "";
    body += "<h1>Recuperação de Senha!</h1>";
    body += "<p>Você está recebendo esse email devido a uma solicitação no site para recuperação de senha.</p>";
    body += "<p>Se não mandou a requisição, pode ignorar o email.</p>";
    body += $"<a href='{linkRecuperaConta}'>Clique aqui para recuperar sua senha.</a>";

    await sendEmail(emailTo, subject, body);
  }

  #region Send email
  private async Task sendEmail(string emailTo, string subject, string body) {
    var emailConfig = _env.Email;
    using var smtpClient = new SmtpClient(emailConfig.Host) {
      Port = emailConfig.Port,
      EnableSsl = emailConfig.Secure,
      Credentials = new NetworkCredential(emailConfig.User, emailConfig.Password),
    };

    var fromAddress = new MailAddress(emailConfig.User, "Alexandre Coletti");
    var toAddress = new MailAddress(emailTo);
    var mailMessage = new MailMessage(fromAddress, toAddress) {
      Subject = subject,
      Body = body,
      IsBodyHtml = true
    };

    try {
      await smtpClient.SendMailAsync(mailMessage);
    } catch (Exception e) {
      Log.Error("Failed to send email: " + e.Message);
    }
  }
  #endregion

  #region EscapeString
  private string EscapeString(string input) {
    return WebUtility.HtmlEncode(input);
  }
  #endregion
}
