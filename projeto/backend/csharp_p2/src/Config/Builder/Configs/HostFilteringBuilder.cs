namespace csharp_p2.src.Config.Builder;

public static class HostFilteringBuilder {
  public static void AddHostFiltering(WebApplicationBuilder builder, EnvConfig env) {
    // Em desenvolvimento, a API pode ser acessada por localhost, IP da rede local
    // ou nome da máquina. Por isso, qualquer Host não vazio é aceito.
    if (env.IsDevelopment) {
      builder.Configuration["AllowedHosts"] = "*";
      return;
    }

    var allowedHosts = env.HostFiltering.AllowedHosts;
    if (allowedHosts.Length == 0) {
      throw new InvalidOperationException("ALLOWED_HOSTS must contain at least one API host outside development.");
    }

    if (allowedHosts.Contains("*")) {
      throw new InvalidOperationException("ALLOWED_HOSTS cannot contain the global wildcard '*' outside development.");
    }

    // AllowedHosts é uma configuração convencional consumida automaticamente
    // pelo HostFilteringMiddleware do ASP.NET Core. Sua lista usa ';' internamente.
    builder.Configuration["AllowedHosts"] = string.Join(';', allowedHosts);
  }
}

/*
 * FLUXO DO HOST FILTERING
 *
 * 1. Toda requisição HTTP possui um header Host que informa o host de destino
 *    da requisição. Por exemplo:
 *
 *      Host: api.exemplo.com
 *
 *    Esse valor é diferente do header Origin:
 *
 *    - Host identifica o destino da requisição;
 *    - Origin identifica a origem de uma requisição feita pelo navegador.
 *
 *
 * 2. O Host Filtering limita quais valores podem ser aceitos no header Host.
 *    Isso reduz a exposição a requisições enviadas com hosts arbitrários e
 *    ajuda a mitigar ataques que dependem da manipulação desse header, como
 *    Host Header Injection e determinados cenários de DNS rebinding.
 *
 *    Essa validação não autentica o usuário e o nome do host não é um segredo.
 *
 *
 * 3. WebApplication.CreateBuilder configura o Host Filtering como parte da
 *    infraestrutura padrão do ASP.NET Core. Por isso, normalmente não é
 *    necessário chamar app.UseHostFiltering() explicitamente.
 *
 *    O middleware utiliza a chave convencional:
 *
 *      AllowedHosts
 *
 *
 * 4. Para manter a leitura das variáveis de ambiente centralizada, EnvConfig
 *    lê ALLOWED_HOSTS como uma lista separada por vírgulas. Este builder
 *    converte essa lista para o formato separado por ponto e vírgula usado
 *    pela configuração AllowedHosts.
 *
 *    Exemplo no .env:
 *
 *      ALLOWED_HOSTS=api.exemplo.com,api-interna.exemplo.com
 *
 *    Valor entregue ao ASP.NET Core:
 *
 *      AllowedHosts=api.exemplo.com;api-interna.exemplo.com
 *
 *
 * 5. Em Development, AllowedHosts recebe o curinga global "*". Esse valor
 *    permite qualquer Host não vazio, facilitando o acesso por localhost,
 *    IP da rede local ou nome da máquina durante o desenvolvimento.
 *
 *
 * 6. Fora de Development, ALLOWED_HOSTS é obrigatório e o curinga global "*"
 *    é rejeitado pela aplicação. Dessa forma, uma configuração ausente ou
 *    totalmente aberta causa falha durante a inicialização.
 *
 *
 * 7. Cada entrada deve conter somente o host, sem protocolo, path ou porta:
 *
 *      Correto:   api.exemplo.com
 *      Incorreto: https://api.exemplo.com
 *      Incorreto: api.exemplo.com:443
 *      Incorreto: api.exemplo.com/api
 *
 *    O ASP.NET Core também aceita curingas de subdomínio:
 *
 *      *.exemplo.com
 *
 *    Nesse caso, o curinga corresponde aos subdomínios, por exemplo:
 *
 *      api.exemplo.com
 *      admin.exemplo.com
 *
 *    mas NÃO corresponde ao domínio raiz:
 *
 *      exemplo.com
 *
 *    Se ambos forem necessários, devem ser configurados separadamente:
 *
 *      exemplo.com;*.exemplo.com
 *
 *
 * 8. Quando existe um proxy reverso, ALLOWED_HOSTS deve considerar o valor de
 *    Host que o proxy efetivamente encaminha ao Kestrel. Preferencialmente,
 *    o proxy deve preservar o host público original da API.
 *
 *    Caso o proxy substitua esse valor por um host interno, a configuração do
 *    proxy e AllowedHosts precisam estar alinhadas.
 *
 *
 * 9. Se o Host recebido não estiver na lista permitida, o
 *    HostFilteringMiddleware interrompe o pipeline e responde HTTP 400 antes
 *    que a requisição chegue aos controllers/endpoints da aplicação.
 *
 *
 * 10. AllowedHosts não substitui outras configurações de infraestrutura:
 *
 *     - CORS controla quais origens de navegador podem acessar a API;
 *     - HTTPS/HSTS protege o transporte;
 *     - Forwarded Headers processa informações enviadas por proxies confiáveis;
 *     - Kestrel/endpoints definem interfaces e portas nas quais o processo escuta.
 *
 *
 * Resumo:
 *
 * ALLOWED_HOSTS no ambiente
 * -> EnvConfig cria a lista
 * -> HostFilteringBuilder valida e preenche AllowedHosts
 * -> HostFilteringMiddleware compara Request.Host
 * -> requisição permitida ou HTTP 400
 */
