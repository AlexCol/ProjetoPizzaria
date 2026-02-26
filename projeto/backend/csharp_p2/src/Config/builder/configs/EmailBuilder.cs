namespace csharp_p2.src.Extensions;

public static class EmailBuilder {
  public static void AddEmailService(WebApplicationBuilder builder) {

    // //! Cria uma instância de TokenModel para armazenar as configurações do token
    // var emailModel = new EmailModel();

    // //! Configura o tokenModel a partir das configurações fornecidas no arquivo de configuração
    // new ConfigureFromConfigurationOptions<EmailModel>(
    // 		builder.Configuration.GetSection("Email")
    // ).Configure(emailModel);

    // //! Registra o tokenModel como um serviço singleton
    // builder.Services.AddSingleton(emailModel);
  }
}
