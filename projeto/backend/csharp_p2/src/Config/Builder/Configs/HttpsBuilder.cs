namespace csharp_p2.src.Config.Builder;

public static class HttpsBuilder {
  public static void AddHttps(WebApplicationBuilder builder) {
    builder.Services.AddHttpsRedirection(options => {
      // O HTTPS público é terminado pelo proxy reverso na porta padrão.
      options.HttpsPort = 443;
      options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
    });

    builder.Services.AddHsts(options => {
      // Começa com uma política conservadora. IncludeSubDomains e Preload somente
      // devem ser ativados quando todos os subdomínios suportarem HTTPS permanentemente.
      options.MaxAge = TimeSpan.FromDays(30);
      options.IncludeSubDomains = false;
      options.Preload = false;
    });
  }
}

/*
 * FLUXO DE HTTPS E HSTS
 *
 * 1. Em produção, quando a aplicação está atrás de um proxy reverso com
 *    terminação TLS, o certificado HTTPS normalmente fica no proxy.
 *
 *    Nesse cenário:
 *
 *    cliente --HTTPS--> proxy reverso --HTTP ou HTTPS--> Kestrel
 *
 *    Portanto, a conexão entre o proxy e o Kestrel pode utilizar HTTP mesmo
 *    que a requisição pública original tenha sido feita por HTTPS.
 *
 * 2. AddHttpsRedirection configura o middleware responsável por redirecionar
 *    requisições que a aplicação ainda reconhece como HTTP para HTTPS:
 *
 *    - HttpsPort = 443 indica a porta HTTPS pública utilizada no redirect;
 *
 *    - RedirectStatusCode = 307 (Temporary Redirect) preserva o método HTTP
 *      e o corpo da requisição durante o redirecionamento;
 *
 *    - o status 307 indica que o redirecionamento é temporário, evitando
 *      declarar ao cliente que aquela mudança de URL é permanente.
 *
 * 3. AddHsts configura a política HTTP Strict Transport Security (HSTS).
 *
 *    Quando UseHsts adiciona o header Strict-Transport-Security a uma resposta
 *    HTTPS, navegadores compatíveis podem memorizar que aquele host deve ser
 *    acessado somente por HTTPS durante o período definido em MaxAge.
 *
 *    Neste caso:
 *
 *    MaxAge = 30 dias
 *
 *    Durante esse período, depois que o navegador tiver recebido e aceitado
 *    a política HSTS, ele pode converter futuras tentativas de acesso HTTP
 *    ao mesmo host diretamente para HTTPS antes mesmo de enviar a requisição
 *    HTTP ao servidor.
 *
 * 4. IncludeSubDomains e Preload permanecem desabilitados por serem opções
 *    com impacto mais amplo:
 *
 *    - IncludeSubDomains faz a política HSTS também se aplicar aos subdomínios;
 *
 *    - Preload adiciona a diretiva "preload" ao header, utilizada como parte
 *      do processo para inclusão do domínio em listas HSTS preload mantidas
 *      pelos navegadores.
 *
 *    Essas opções só devem ser utilizadas quando a infraestrutura correspondente
 *    estiver preparada para operar permanentemente por HTTPS.
 *
 *    IncludeSubDomains, em particular, pode afetar outros serviços existentes
 *    nos subdomínios caso algum deles ainda dependa de HTTP.
 *
 * 5. No pipeline, UseForwardedHeaders deve executar antes de UseHsts e
 *    UseHttpsRedirection.
 *
 *    O motivo é que, quando o TLS termina no proxy, o Kestrel pode receber
 *    internamente uma conexão HTTP mesmo que o cliente tenha utilizado HTTPS.
 *
 *    O proxy informa o protocolo original através de:
 *
 *    X-Forwarded-Proto: https
 *
 *    Depois que UseForwardedHeaders valida o proxy e processa esse header,
 *    HttpContext.Request.Scheme passa a representar o protocolo original
 *    processado da requisição.
 *
 *    Portanto:
 *
 *    cliente --HTTPS--> proxy --HTTP--> Kestrel
 *                         |
 *                         +--> X-Forwarded-Proto: https
 *
 *    UseForwardedHeaders
 *        -> Request.Scheme = "https"
 *
 *    UseHttpsRedirection
 *        -> reconhece que a requisição pública já utiliza HTTPS
 *        -> não gera um novo redirect
 *
 *    Se X-Forwarded-Proto não for processado corretamente, a aplicação pode
 *    interpretar a conexão interna HTTP como uma requisição pública HTTP e
 *    tentar redirecioná-la novamente, podendo causar redirects incorretos ou
 *    até loops dependendo da configuração do proxy.
 *
 * 6. UseHsts e UseHttpsRedirection são ativados somente fora de Development.
 *
 *    Isso evita aplicar HSTS ao ambiente local e permite que o desenvolvimento
 *    utilize HTTP ou os mecanismos próprios de HTTPS de desenvolvimento sem
 *    persistir uma política HSTS desnecessariamente no navegador.
 *
 * 7. Essa configuração não cria, instala nem gerencia certificados TLS.
 *
 *    Quando o HTTPS público termina no proxy, a infraestrutura publicada ainda
 *    precisa:
 *
 *    - possuir um certificado TLS válido;
 *    - aceitar as conexões HTTPS públicas;
 *    - encaminhar as requisições para a aplicação;
 *    - fornecer corretamente X-Forwarded-Proto;
 *    - ter o endereço do proxy configurado como confiável em KnownProxies /
 *      TRUSTED_PROXIES.
 *
 *    A configuração de Forwarded Headers é especialmente importante porque
 *    X-Forwarded-Proto só deve ser utilizado quando recebido através de uma
 *    origem reconhecida como confiável.
 *
 * 8. O frontend publicado deve chamar diretamente a URL HTTPS da API.
 *
 *    Exemplo:
 *
 *    https://api.exemplo.com
 *
 *    e não:
 *
 *    http://api.exemplo.com
 *
 *    esperando que o backend faça o redirect.
 *
 *    Isso é especialmente importante em requisições cross-origin. Um preflight
 *    CORS (OPTIONS) enviado por HTTP e redirecionado para HTTPS por
 *    UseHttpsRedirection pode falhar no navegador.
 *
 *    Portanto, para APIs, HTTPS Redirection funciona como uma proteção adicional
 *    para requisições HTTP que eventualmente cheguem à aplicação, mas não
 *    substitui a configuração correta da URL HTTPS nos clientes.
 *
 * Resumo:
 *
 * cliente usa HTTPS
 *   -> proxy reverso termina o TLS
 *   -> proxy encaminha a requisição ao Kestrel
 *   -> proxy envia X-Forwarded-Proto: https
 *   -> UseForwardedHeaders valida o proxy e atualiza Request.Scheme
 *   -> UseHsts adiciona Strict-Transport-Security às respostas aplicáveis
 *   -> UseHttpsRedirection redireciona apenas requisições que ainda sejam
 *      reconhecidas pela aplicação como HTTP
 */
