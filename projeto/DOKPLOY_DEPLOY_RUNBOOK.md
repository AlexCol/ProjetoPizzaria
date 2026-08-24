# Runbook de deploy — Projeto Pizzaria no Dokploy

## 00. Objetivo

Publicar o monorepo `AlexCol/ProjetoPizzaria`, branch `main`, em duas Applications independentes no Dokploy. O GitHub Actions valida apenas o projeto alterado e só então aciona a API oficial de deploy para a Application correspondente.

## 01. Arquitetura confirmada

```text
Internet -> Traefik/Dokploy
  <FRONTEND_DOMAIN> -> pizzaria-frontend (Angular/Nginx :80)
  <BACKEND_DOMAIN>  -> pizzaria-backend (ASP.NET Core :8080)
                             |-> PostgreSQL
                             |-> Valkey/Redis (cache, Data Protection e Hangfire)
                             `-> volume de arquivos
```

Fatos do repositório: frontend Angular 21 estático; backend ASP.NET Core `net10.0`; banco via Npgsql; cache e Data Protection via Redis/Valkey; Hangfire; cookies + CSRF; health endpoint `GET /api/health`; e gerenciador de arquivos local ou Cloudinary.

Decisões deste runbook: Dockerfiles multi-stage; Node 22; backend na porta interna 8080; frontend Nginx na porta 80; PostgreSQL e Valkey como serviços internos do Dokploy; arquivo local em `/data/files`; deploy pela API oficial do Dokploy somente após CI. Domínios e credenciais permanecem `<DEFINIR>`. Os arquivos necessários ainda não existem fisicamente: as seções abaixo orientam sua criação e fornecem o conteúdo completo.

## 02. Pré-requisitos

- Dokploy funcional e integrado ao GitHub com acesso ao repositório.
- DNS de `<FRONTEND_DOMAIN>` e `<BACKEND_DOMAIN>` apontando para a VPS.
- Branch `main` protegida, exigindo os checks de CI.
- No GitHub, cadastrar `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_BACKEND_APPLICATION_ID` e `DOKPLOY_FRONTEND_APPLICATION_ID` como Actions Secrets.
- Desabilitar Auto Deploy por push nas duas Applications; o único trigger automático de produção será a chamada à API do Dokploy após o CI aprovado.
- Se os workflows forem configurados como checks obrigatórios da branch `main`, revisar a política de branch protection/ruleset: workflows filtrados por `paths` podem não executar em alterações fora do respectivo projeto. Não torne ambos obrigatórios globalmente sem validar esse comportamento.

## 03. Inventário de build

| Componente | Caminho | Build validado pelo CI | Artefato/entrypoint |
|---|---|---|---|
| Backend | `projeto/backend/csharp_p2` | `dotnet restore`, `build`, `test`, `publish` | `csharp_p2.dll` |
| Frontend | `projeto/web/angular_p2` | `npm ci`, `lint`, `test`, `build` | `dist/angular_p2/browser` |

Não existe projeto de testes .NET atualmente; `dotnet test` fica no pipeline e passará a executar testes quando um projeto de teste for adicionado à solution. O Angular está configurado com Vitest, mas ainda não contém arquivos `*.spec.ts`/`*.test.ts`; o workflow detecta isso e pula o runner até existirem testes. Não há dependência compartilhada na raiz que justifique ampliar os path filters.

## 04. Preparar valores antes do primeiro deploy

Definir:

- `<FRONTEND_DOMAIN>` e `<BACKEND_DOMAIN>`, sem caminho e com HTTPS;
- nomes, usuário e senhas do PostgreSQL;
- senha do Valkey;
- SMTP e e-mail administrador;
- secret longo e aleatório para `CRYPTO_SECRET` e `FILE_MANAGER_SECRET_KEY` quando aplicável; `ADMIN_PASSWORD` deve ser um hash BCrypt da senha inicial, não texto puro;
- proxies confiáveis conforme a rede do Dokploy.

Antes do build, trocar `apiBaseUrl` em `projeto/web/angular_p2/src/environments/environment.ts` de `https://api.meusite.com/api` para `https://<BACKEND_DOMAIN>/api`. Esse valor é compilado no bundle e não é variável runtime do container.

## 05. Criar a infraestrutura no Dokploy

O PostgreSQL é obrigatório. Para produção, este runbook escolhe Valkey, acessado pelo protocolo Redis, para cache, sessões, Data Protection e Hangfire. A persistência do Valkey não é necessária apenas por causa do cache: Data Protection e Hangfire armazenam estado operacional cuja perda pode invalidar cookies/chaves ou perder jobs. Por isso, trate seu volume como necessário.

> **Terminologia do Dokploy:** a tela de Databases oferece um serviço chamado **Redis**. Para este projeto, crie esse serviço com a imagem customizada `valkey/valkey:8.1-alpine`. O backend deve continuar com `CACHE_TYPE=Valkey`. Se a versão instalada do Dokploy não conseguir iniciar a imagem customizada, use temporariamente a imagem nativa `redis:8-alpine` e altere `CACHE_TYPE=Redis`; não chame uma instância Redis de Valkey apenas no nome.

### 05.1 Criar Project e Environment

1. No Dashboard do Dokploy, clique em **Create Project**.
2. Use o nome `Projeto Pizzaria` e uma descrição que identifique o sistema.
3. Entre no projeto e crie ou renomeie o Environment de produção para `production`.
4. Dentro de `production`, crie todos estes recursos:

   ```text
   Projeto Pizzaria
   `-- production
       |-- pizzaria-postgres   (Database/PostgreSQL)
       |-- pizzaria-valkey     (Database/Redis com imagem Valkey)
       |-- pizzaria-backend    (Application)
       `-- pizzaria-frontend   (Application)
   ```

5. Se o Dokploy solicitar um **Server**, selecione o mesmo servidor para os quatro recursos. Este runbook assume o Dokploy Server padrão, ou um único Remote Server de produção. Remote Servers diferentes possuem Docker e redes independentes; apenas escolher o mesmo nome de Environment não cria comunicação entre máquinas distintas.

O que mantém os serviços na mesma rede é a combinação **mesmo Environment + mesmo Server**. Em recursos nativos de Application/Database, o Dokploy administra a rede Docker; não é necessário digitar `dokploy-network`, criar uma rede manual ou publicar portas. Environments diferentes são isolados entre si.

Regras para não quebrar a comunicação interna:

- criar PostgreSQL, Valkey e backend dentro de `Projeto Pizzaria / production`;
- escolher o mesmo Server em todos eles;
- usar no backend somente o **Internal Host** exibido pelo Dokploy;
- usar as portas internas `5432` e `6379`;
- nunca usar `localhost`: dentro do container da API, `localhost` é a própria API;
- nunca usar o domínio público, IP da VPS ou External Connection URL para a comunicação entre containers;
- deixar **External Port (Internet)** vazio/desabilitado para PostgreSQL e Valkey;
- não adicionar domínio HTTP ao PostgreSQL ou ao Valkey.

Se um recurso for movido para outro Environment ou Server posteriormente, considere a rede rompida até repetir os testes de conexão e atualizar os hosts internos.

### 05.2 Gerar e guardar as credenciais

Antes de abrir os formulários, gere valores diferentes e aleatórios para:

```text
POSTGRES_USER=pizzaria_app
POSTGRES_PASSWORD=<SECRET_FORTE_EXCLUSIVO>
POSTGRES_DATABASE=pizzaria
VALKEY_PASSWORD=<OUTRO_SECRET_FORTE_EXCLUSIVO>
```

Não reutilize a senha administrativa, `CRYPTO_SECRET` ou a senha do Dokploy. Gere o hash BCrypt de `ADMIN_PASSWORD` offline, guarde a senha original no password manager e coloque somente o hash no Dokploy. No Git, mantenha apenas placeholders.

### 05.3 Criar o PostgreSQL

1. Acesse `Projeto Pizzaria -> production`.
2. Clique em **Create Service** ou **Add Service**, conforme o rótulo da versão instalada.
3. Escolha **Database -> PostgreSQL**.
4. Preencha:

   | Campo no Dokploy | Valor deste projeto |
   |---|---|
   | Name | `pizzaria-postgres` |
   | App Name, se exibido | manter o valor gerado ou usar `pizzaria-postgres` |
   | Database Name | `pizzaria` |
   | Database User | `pizzaria_app` |
   | Database Password | o `POSTGRES_PASSWORD` gerado na etapa anterior |
   | Docker Image | `postgres:16-alpine` |
   | Environment | `production` |
   | Server, se exibido | o mesmo selecionado para o backend |

5. Crie o serviço, mas não preencha **External Port (Internet)**.
6. Em **Advanced -> Volumes**, confirme que existe armazenamento persistente montado em `/var/lib/postgresql/data`. Bancos criados pelo recurso nativo normalmente recebem esse volume; não prossiga se ele estiver ausente.
7. Opcionalmente, em **Environment**, configure `TZ=America/Sao_Paulo` e `PGTZ=America/Sao_Paulo`. Datas da aplicação devem continuar sendo armazenadas em UTC.
8. Clique em **Deploy**.
9. Acompanhe **Logs** até o PostgreSQL informar que está pronto para aceitar conexões.
10. Abra **Connection** ou **Credentials -> Internal Credentials** e registre exatamente:

    - Internal Host;
    - Internal Port, esperado `5432`;
    - User;
    - Database Name.

11. Transfira esses valores para a Application do backend:

    ```dotenv
    DB_TYPE=postgres
    DB_HOST=<INTERNAL_HOST_EXIBIDO_PELO_DOKPLOY>
    DB_PORT=5432
    DB_USER=pizzaria_app
    DB_PASS=<POSTGRES_PASSWORD>
    DB_NAME=pizzaria
    ```

Não presuma que o host seja `pizzaria-postgres`: copie o **Internal Host** mostrado pela instalação, pois o nome efetivo pode incluir um identificador gerado.

### 05.4 Criar o Valkey

1. Ainda em `Projeto Pizzaria -> production`, clique em **Create Service/Add Service**.
2. Escolha **Database -> Redis**. O Dokploy usa o nome Redis para este tipo de serviço, mesmo quando uma imagem compatível é configurada.
3. Preencha:

   | Campo no Dokploy | Valor deste projeto |
   |---|---|
   | Name | `pizzaria-valkey` |
   | App Name, se exibido | manter o valor gerado ou usar `pizzaria-valkey` |
   | Database Password | o `VALKEY_PASSWORD` gerado anteriormente |
   | Docker Image | `valkey/valkey:8.1-alpine` |
   | Environment | `production` |
   | Server, se exibido | exatamente o mesmo do PostgreSQL e backend |

4. Crie o serviço e mantenha **External Port (Internet)** vazio/desabilitado.
5. Em **Advanced -> Volumes**, confirme um volume persistente montado em `/data`.
6. Confirme no Preview/Advanced qual comando será executado. A instância precisa iniciar com autenticação, AOF e sem eviction. Se a troca de imagem não preservar essas opções, defina o Run Command abaixo **no campo `Advanced -> Command` do Dokploy**, substituindo o placeholder pelo mesmo secret cadastrado no Database:

   ```text
   valkey-server --appendonly yes --appendfsync everysec --maxmemory-policy noeviction --requirepass <VALKEY_PASSWORD>
   ```

   Não execute `valkey-server ...` no Terminal do container: a instância principal já usa a porta 6379 e uma segunda instância falhará com `Address in use`. Substitua `<VALKEY_PASSWORD>` pela senha real **sem aspas**. Nesse campo, o Dokploy separa o Command diretamente em argumentos e preserva aspas simples ou duplas como parte do valor; com `--requirepass 'senha'`, a senha efetiva se torna literalmente `'senha'`. O Run Command customizado substitui o comando padrão. Não remova `--requirepass`, não grave o comando com a senha real no Git e não altere uma instância que já possua dados sem backup e procedimento de migração.

7. Clique em **Deploy** e acompanhe **Logs**. Se a imagem customizada for incompatível com a automação da versão instalada do Dokploy, pare aqui e use o fallback Redis descrito no início desta seção.
8. Pelo Terminal do serviço, valide:

   ```sh
   printf 'Valkey password: '
   read -r -s VALKEYCLI_AUTH
   export VALKEYCLI_AUTH
   printf '\n'
   valkey-cli PING
   valkey-cli CONFIG GET appendonly
   valkey-cli CONFIG GET appendfsync
   valkey-cli CONFIG GET maxmemory-policy
   unset VALKEYCLI_AUTH
   ```

   Digite a senha quando solicitado; ela não será exibida nem gravada no comando. O resultado esperado é `PONG`, `appendonly=yes`, `appendfsync=everysec` e `maxmemory-policy=noeviction`.

9. Abra **Connection/Credentials -> Internal Credentials** e copie o **Internal Host** e a porta interna `6379`.
10. Configure a Application do backend:

    ```dotenv
    CACHE_TYPE=Valkey
    CACHE_HOST=<INTERNAL_HOST_EXIBIDO_PELO_DOKPLOY>
    CACHE_PORT=6379
    CACHE_USER=
    CACHE_PASSWORD=<VALKEY_PASSWORD>
    CACHE_DB=0
    CACHE_SSL=false
    HANGFIRE_STORAGE_TYPE=Redis
    HANGFIRE_REDIS_DB=1
    HANGFIRE_REDIS_PREFIX={pizzaria-hangfire}:
    DATA_PROTECTION_APPLICATION_NAME=pizzaria
    DATA_PROTECTION_REDIS_KEY={pizzaria-data-protection}:keys
    ```

`HANGFIRE_STORAGE_TYPE=Redis` identifica o provider/protocolo usado pelo Hangfire; ele reutiliza a mesma conexão compatível fornecida pelo Valkey. `CACHE_SSL=false` só é aceitável porque o tráfego permanece na rede interna do mesmo servidor. Se os serviços passarem a se comunicar por outra máquina ou rede não confiável, configure TLS e reabra essa decisão.

### 05.5 Configurar persistência e backups

1. No PostgreSQL, abra a aba **Backup**.
2. Cadastre antes um destino S3 compatível em `Settings -> Destinations`, caso ainda não exista.
3. Crie um backup com:

   | Campo | Valor inicial sugerido |
   |---|---|
   | Destination | bucket S3 de produção |
   | Database Name | `pizzaria` |
   | Schedule | diário, em horário de menor uso |
   | Prefix | `pizzaria/production/postgres` |
   | Enabled | ativo |

4. Use **Test** e confirme que o arquivo chegou ao bucket.
5. Execute uma restauração de teste em um banco separado antes do go-live. Arquivo de backup sem restauração testada não atende ao critério deste runbook.
6. Para Valkey, configure **Volume Backup** do volume montado em `/data`, se a versão instalada disponibilizar backup de volume para Database/Redis. Use outro prefixo, por exemplo `pizzaria/production/valkey`, e teste a restauração fora da instância de produção.
7. Para arquivos locais da aplicação, use um named volume em `/data/files` para permitir Volume Backup; bind mounts não participam do mecanismo automático de Volume Backups do Dokploy.

O dump lógico do PostgreSQL é a fonte principal para recuperação dos dados de negócio. O backup do Valkey preserva jobs do Hangfire e chaves do Data Protection, mas não substitui o backup do PostgreSQL.

### 05.6 Validar a rede e as dependências

Depois de criar a Application do backend conforme a seção 06 e preencher os Internal Hosts:

1. Faça o primeiro deploy do backend.
2. Confirme nos logs que o entrypoint gerou/validou as migrations, executou `database update` no PostgreSQL e só então iniciou a API.
3. Abra `https://<BACKEND_DOMAIN>/api/health`.
4. Confirme que API, banco e cache são reportados como saudáveis.
5. Faça login e confirme a criação de sessão.
6. No Valkey, confirme a existência de chaves de sessão e de `{pizzaria-data-protection}:keys` sem imprimir seus valores.
7. Aguarde ou dispare de forma controlada um job e confirme que o namespace `{pizzaria-hangfire}:` foi criado no DB lógico `1`.
8. Reinicie separadamente backend, PostgreSQL e Valkey. Depois de cada reinício, repita health e login; jobs/chaves devem permanecer válidos.

Diagnóstico rápido:

| Sintoma | Verificação |
|---|---|
| `Name or service not known` | `DB_HOST`/`CACHE_HOST` não é o Internal Host correto, ou o recurso está em outro Environment/Server |
| `Connection refused` | serviço parado, porta interna errada ou deploy incompleto |
| timeout | recursos em servidores/redes diferentes ou regra de firewall/rede alterada |
| autenticação do PostgreSQL falha | usuário, senha ou database não coincide com Internal Credentials |
| `NOAUTH` no Valkey | `CACHE_PASSWORD` não coincide com `--requirepass`/Database Password |
| health redireciona em loop | `TRUSTED_PROXIES`/forwarded headers do Traefik configurados incorretamente |

Não resolva falhas internas publicando 5432 ou 6379 na internet. Corrija Environment, Server, Internal Host e credenciais.

## 06. Application do backend

### 06.1 Criar os arquivos de containerização

O `start.sh` existente é exclusivo do ambiente de desenvolvimento e **não deve ser usado como entrypoint no Dokploy**. Ele exige um `.env` físico, sobe PostgreSQL e Valkey com Docker Compose, executa `dotnet format`, aplica migrations e inicia `dotnet run`. No Dokploy, banco e cache já são serviços separados; dar acesso ao Docker da VPS para o container também seria um risco desnecessário.

Por decisão deste projeto, `Migrations/` permanece no `.gitignore`: os arquivos não são enviados ao Git. No destino, o entrypoint gera a migration inicial quando ainda não existe snapshot persistido; nos deploys seguintes, usa `has-pending-model-changes` e gera outra migration somente quando o modelo mudou. Em seguida executa `database update` e só inicia a API se a atualização concluir.

Esse fluxo exige obrigatoriamente **uma réplica** e um named volume persistente montado em `/src/Migrations`. Sem esse volume, cada imagem começaria sem histórico de código e tentaria gerar uma nova migration inicial contra um banco que já possui tabelas. O volume de migrations e o PostgreSQL devem ser incluídos no backup operacional.

Crie `projeto/backend/csharp_p2/Dockerfile` com:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src
ENV NUGET_PACKAGES=/opt/nuget
COPY . .
RUN rm -rf bin obj Migrations \
    && mkdir -p Migrations \
    && dotnet restore csharp_p2.csproj \
    && dotnet publish csharp_p2.csproj \
      --configuration Release \
      --output /app/publish \
      --no-restore \
      /p:UseAppHost=false
RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.11

FROM build AS final
WORKDIR /src
RUN mkdir -p /app/Log /data/files /tmp/dotnet Migrations \
    && chown -R app:app /app /data /src /tools /opt/nuget /tmp/dotnet
USER app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_CLI_HOME=/tmp/dotnet \
    NUGET_PACKAGES=/opt/nuget
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "/src/docker-entrypoint.sh"]
```

A imagem final mantém SDK, fonte e `dotnet-ef` porque a geração ocorre no destino. Isso aumenta o tamanho da imagem de forma consciente; não troque o estágio final por `aspnet` enquanto essa decisão arquitetural permanecer.

O arquivo `projeto/backend/csharp_p2/docker-entrypoint.sh` versionado é responsável por:

1. verificar se o volume possui `*ModelSnapshot.cs`;
2. gerar `Initial_<timestamp>` quando o volume está vazio;
3. executar `has-pending-model-changes` e gerar `Deploy_<timestamp>` somente quando necessário;
4. executar `dotnet ef database update` com as variáveis `DB_*` reais;
5. iniciar `/app/publish/csharp_p2.dll` apenas após sucesso.

Crie `projeto/backend/csharp_p2/.dockerignore` com:

```text
bin/
obj/
.git/
.env
.env.*
Log/
docker/
Migrations/
*.user
*.suo
```

Na raiz desse projeto, valide antes do commit:

```bash
dotnet restore csharp_p2.sln
dotnet build csharp_p2.sln --configuration Release --no-restore
dotnet test csharp_p2.sln --configuration Release --no-build
docker build --tag pizzaria-backend:local .
```

O repositório ainda não possui projeto de testes .NET; atualmente `dotnet test` valida a solution sem executar casos de teste.

O `docker build` valida compilação, publicação, instalação do `dotnet-ef` e composição da imagem. A geração/aplicação das migrations só pode ser validada no start, pois depende das variáveis e da rede reais do Dokploy. O EF registra as migrations aplicadas na tabela `__EFMigrationsHistory`; os respectivos arquivos e o snapshot permanecem no volume `/src/Migrations`.

> **Validação da imagem Alpine:** o Dockerfile usa imagens .NET Alpine. Antes do go-live, execute os principais fluxos funcionais dentro dessa imagem, especialmente recursos que possam depender de bibliotecas nativas. Se alguma dependência exigir glibc ou outra biblioteca ausente no Alpine, troque as imagens `*-alpine` pelas imagens Debian-based equivalentes do .NET e repita os testes.

### 06.2 Configurar a Application

Configure:

| Campo | Valor |
|---|---|
| Name | `pizzaria-backend` |
| Provider/repository/branch | GitHub / `AlexCol/ProjetoPizzaria` / `main` |
| Build Path | `projeto/backend/csharp_p2` |
| Build type | `Dockerfile` |
| Docker File | `Dockerfile` |
| Docker Context Path | `.` |
| Docker Build Stage | deixar vazio (usa o último estágio, `final`) |
| Container port | `8080` |
| Domain | `<BACKEND_DOMAIN>`, HTTPS ativo |
| Healthcheck | HTTP `GET /api/health`, porta 8080 |
| Watch path | `projeto/backend/csharp_p2/**` (opcional; não é usado como controle principal com Auto Deploy desativado) |
| Auto Deploy | desativado |
| Restart | on-failure/always |

Na tela **General**, salve primeiro a configuração do provedor Git. Como o
`Build Path` já posiciona o build dentro de `projeto/backend/csharp_p2`, os
campos do tipo de build são relativos a essa pasta: `Docker File=Dockerfile` e
`Docker Context Path=.`. Não repita `projeto/backend/csharp_p2` nesses dois
campos. Deixe `Docker Build Stage` vazio para que o Docker use o último estágio
do Dockerfile multi-stage (`final`).

Variáveis (preencher secrets no Dokploy, nunca no Git):

```dotenv
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
FRONTEND_URL=https://<FRONTEND_DOMAIN>
ALLOWED_HOSTS=<BACKEND_DOMAIN>
TRUSTED_PROXIES=<DEFINIR_HOSTS_OU_REDES_DO_PROXY_DOKPLOY>
ADMIN_EMAIL=<DEFINIR>
ADMIN_PASSWORD=<HASH_BCRYPT_DA_SENHA_INICIAL>
DB_TYPE=postgres
DB_HOST=<HOST_INTERNO_POSTGRES>
DB_PORT=5432
DB_USER=<SECRET>
DB_PASS=<SECRET>
DB_NAME=<DEFINIR>
DB_MIN_POOL=1
DB_MAX_POOL=20
DB_ACQUIRE_TIMEOUT_MILLIS=30000
DB_IDLE_TIMEOUT_MILLIS=300000
CACHE_TYPE=Valkey
CACHE_HOST=<HOST_INTERNO_VALKEY>
CACHE_PORT=6379
CACHE_USER=<DEFINIR_SE_EXIGIDO>
CACHE_PASSWORD=<SECRET>
CACHE_DB=0
CACHE_SSL=false
CACHE_BASE_TTL_IN_SEC=300
CACHE_SESSION_TTL_IN_SEC=3600
CACHE_SSL_HOST=<VAZIO_OU_HOST_TLS_INTERNO>
HANGFIRE_STORAGE_TYPE=Redis
HANGFIRE_REDIS_DB=1
HANGFIRE_REDIS_PREFIX={pizzaria-hangfire}:
DATA_PROTECTION_APPLICATION_NAME=pizzaria
DATA_PROTECTION_REDIS_KEY={pizzaria-data-protection}:keys
EMAIL_HOST=<DEFINIR>
EMAIL_PORT=<DEFINIR>
EMAIL_USER=<SECRET>
EMAIL_PASS=<SECRET>
EMAIL_SECURE=true
CRYPTO_SECRET=<SECRET>
FILE_MANAGER_TYPE=local
FILE_MANAGER_BASE_PATH=/data/files
FILE_MANAGER_ENDPOINT=<VAZIO>
FILE_MANAGER_REGION=<VAZIO>
FILE_MANAGER_BUCKET=<VAZIO>
FILE_MANAGER_ACCESS_KEY=<VAZIO>
FILE_MANAGER_SECRET_KEY=<VAZIO>
FILE_MANAGER_FOLDER=<VAZIO>
FILEX_MAX_BYTES=<DEFINIR_CONFORME_REGRA_DO_NEGOCIO>
FILEX_ALLOWED_EXTENSIONS=<DEFINIR_CONFORME_REGRA_DO_NEGOCIO>
```

Em **Advanced -> Volumes** da Application backend, crie obrigatoriamente um
**Volume Mount** com:

| Campo | Valor |
|---|---|
| Volume Name | `pizzaria-backend-migrations` |
| Mount Path | `/src/Migrations` |

Não use o mesmo volume do PostgreSQL nem de arquivos. Esse volume preserva o
snapshot e os arquivos gerados pelo EF entre imagens/deploys. Crie o volume
antes do primeiro deploy; depois que o banco tiver migrations aplicadas, não
remova, renomeie nem substitua esse volume sem um procedimento de recuperação.

Para armazenamento local, monte outro volume persistente em `/data/files`.
Opcionalmente monte outro em `/app/Log`; os logs de console devem ser a fonte
primária no Dokploy.

`Program.cs` executa `RunSeedsAsync()` automaticamente depois que o processo da
API inicia, inclusive em Production. Os seeds verificam a existência dos dados
antes de inserir roles, processos e o administrador. `ADMIN_PASSWORD` deve
conter um hash BCrypt válido (normalmente 60 caracteres), porque o valor é salvo
diretamente no banco; nunca coloque a senha administrativa em texto puro.

Como alternativa confirmada pelo código, use Cloudinary. Nesse caso, substitua somente o bloco `FILE_MANAGER_*` acima por:

```dotenv
FILE_MANAGER_TYPE=Cloudinary
FILE_MANAGER_BASE_PATH=<VAZIO>
FILE_MANAGER_ENDPOINT=<VAZIO>
FILE_MANAGER_REGION=<VAZIO>
FILE_MANAGER_BUCKET=<CLOUDINARY_CLOUD_NAME>
FILE_MANAGER_ACCESS_KEY=<CLOUDINARY_API_KEY>
FILE_MANAGER_SECRET_KEY=<SECRET_CLOUDINARY_API_SECRET>
FILE_MANAGER_FOLDER=<PASTA_BASE_OPCIONAL>
FILEX_MAX_BYTES=<DEFINIR_CONFORME_REGRA_DO_NEGOCIO>
FILEX_ALLOWED_EXTENSIONS=<DEFINIR_CONFORME_REGRA_DO_NEGOCIO>
```

Com Cloudinary, o volume `/data/files` não é necessário. Não configure S3/MinIO: o validador atual aceita somente `Local` e `Cloudinary`.

Como cookies usam credenciais e CSRF, `FRONTEND_URL` deve ser a origem exata HTTPS. O TLS público termina no Traefik e o tráfego Traefik -> container pode permanecer HTTP. Isso, por si só, **não exige remover** a configuração de HTTPS/HSTS do ASP.NET Core. Garanta que `ForwardedHeaders` seja processado antes de `UseHttpsRedirection()` e que o proxy imediato seja confiável, para que `X-Forwarded-Proto: https` atualize corretamente `Request.Scheme`. Antes do go-live, confirme a origem/IP real apresentada pelo Traefik ao container, preencha `TRUSTED_PROXIES` de acordo com o formato aceito pela aplicação e valide que não existe loop de redirecionamento.

## 07. Application do frontend

### 07.1 Definir a URL de produção

Edite `projeto/web/angular_p2/src/environments/environment.ts` antes de gerar a imagem:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://<BACKEND_DOMAIN>/api',
};
```

Esse valor é compilado no bundle. Alterá-lo no Dokploy sem reconstruir a imagem não surte efeito.

### 07.2 Criar os arquivos de containerização

Crie `projeto/web/angular_p2/Dockerfile` com:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/angular_p2/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
```

Crie `projeto/web/angular_p2/nginx.conf` com:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location \~* \.(?:css|js|jpg|jpeg|gif|png|svg|ico|webp|woff2?)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }
}
```

Crie `projeto/web/angular_p2/.dockerignore` com:

```text
node_modules/
dist/
.angular/
.git/
.env
.env.*
npm-debug.log*
```

Na raiz desse projeto, valide antes do commit:

```bash
npm ci
npm run lint
npm run build -- --configuration production
docker build --tag pizzaria-frontend:local .
```

O runner de testes Angular falha atualmente porque não há arquivos `*.spec.ts` ou `*.test.ts`. O workflow abaixo detecta essa condição; assim que testes forem adicionados, passa a executá-los automaticamente.

### 07.3 Configurar a Application

Configure:

| Campo | Valor |
|---|---|
| Name | `pizzaria-frontend` |
| Provider/repository/branch | GitHub / `AlexCol/ProjetoPizzaria` / `main` |
| Build type | Dockerfile |
| Build path/context | `projeto/web/angular_p2` |
| Dockerfile | `Dockerfile` |
| Container port | `80` |
| Domain | `<FRONTEND_DOMAIN>`, HTTPS ativo |
| Healthcheck | HTTP `GET /`, porta 80 |
| Watch path | `projeto/web/angular_p2/**` (opcional; não é usado como controle principal com Auto Deploy desativado) |
| Auto Deploy | desativado |
| Volumes/variáveis | nenhum |

O `nginx.conf` aplica fallback de SPA para `index.html`. Assets são imutáveis e não precisam de volume.

## 08. GitHub Actions e mapeamento

Crie o diretório `.github/workflows` na raiz do repositório, caso ainda não exista. Os dois arquivos a seguir usam filtros `paths` independentes no GitHub Actions. Esses filtros são o controle principal de qual CI/CD executa; `Watch Paths` no Dokploy é apenas informativo/defensivo enquanto `Auto Deploy` estiver desativado:

```text
projeto/backend/csharp_p2/** -> CI backend -> deploy backend via API
projeto/web/angular_p2/**    -> CI frontend -> deploy frontend via API
```

Em pull requests, só há CI. Em push na `main`, o job `deploy` depende do CI e chama a API oficial do Dokploy. Um CI falho impede o deploy. Mudanças nos dois paths executam os dois fluxos em paralelo; `concurrency` impede sobreposição de deploys do mesmo componente.

### 08.0 Secrets para a API do Dokploy

Primeiro, gere a API key no Dokploy:

1. Abra o menu da conta/perfil no painel do Dokploy.
2. Entre em **Profile** e localize a seção **API/CLI Keys**.
3. Clique em **Generate New Key**.
4. Informe um nome descritivo, por exemplo `PizzariaKey`, e confirme a criação.
5. Copie imediatamente o token completo mostrado pelo Dokploy e guarde-o apenas
   no gerenciador de secrets. Esse token completo será o valor de
   `DOKPLOY_API_KEY` no GitHub.

O nome `PizzariaKey` e o nome/prefixo que continua aparecendo na lista de chaves
não são o token de autenticação. Se o modal com o token completo foi fechado sem
que ele fosse copiado, exclua essa chave, gere outra e copie o novo token. Não
envie o token por mensagem, não o coloque no `.env` versionado e não o grave no
arquivo de workflow.

Depois, saia da área de repositórios do Dokploy e abra o repositório diretamente
no site `github.com`. Para este projeto, use:

```text
https://github.com/AlexCol/ProjetoPizzaria/settings/secrets/actions
```

Pela navegação do GitHub, o caminho equivalente é:

```text
Repository
  -> Settings
  -> Secrets and variables
  -> Actions
  -> New repository secret
```

Se a aba **Settings** não estiver visível no cabeçalho do repositório, abra o
menu de reticências (`...`). Se ela também não aparecer nesse menu ou a URL
direta retornar acesso negado/404, a conta autenticada não possui permissão de
administração suficiente sobre o repositório.

Crie quatro **Repository secrets**, um de cada vez. No formulário do GitHub,
coloque somente o identificador na caixa **Name** e somente o conteúdo na caixa
**Secret**; não digite `=`, espaços, aspas ou os sinais `<` e `>`:

| Name | Secret |
|---|---|
| `DOKPLOY_URL` | `https://<DOMINIO_DO_DOKPLOY>` |
| `DOKPLOY_API_KEY` | token completo gerado pelo Dokploy |
| `DOKPLOY_BACKEND_APPLICATION_ID` | ID da Application backend |
| `DOKPLOY_FRONTEND_APPLICATION_ID` | ID da Application frontend |

Exemplo do primeiro cadastro: **Name** = `DOKPLOY_URL`; **Secret** =
`https://dokploy.example.com`. A notação `NOME=valor` é usada em arquivos
`.env`, mas não deve ser colada no campo **Name** do GitHub.

Use em `DOKPLOY_URL` somente a origem pública do painel, sem `/api` e,
preferencialmente, sem a barra final. Exemplo:

```text
https://dokploy.example.com
```

Os dois `APPLICATION_ID` não são o nome da Application, o nome do serviço
Docker nem o ID do Project/Environment. Para obtê-los, abra cada Application
no painel do Dokploy e copie da URL o identificador que aparece depois de
`/services/application/` e antes de `?`, por exemplo:

```text
https://dokploy.example.com/dashboard/project/<PROJECT_ID>/services/application/<APPLICATION_ID>?tab=general
```

Repita o procedimento em `pizzaria-backend` e `pizzaria-frontend`. Como método
alternativo e oficial, depois de gerar a API key execute `GET /api/project.all`
com o header `x-api-key`; a resposta lista os projetos, Applications e seus
respectivos campos `applicationId`.

A API oficial utilizada pelos workflows é:

```text
POST /api/application.deploy
Header: x-api-key: <token>
Body: { "applicationId": "..." }
```

Não grave a API key, IDs ou URL administrativa diretamente no YAML. Antes de habilitar o primeiro deploy automático, teste a chamada manualmente e confirme resposta HTTP 2xx.

Exemplo de teste manual a partir de um terminal seguro:

```bash
curl --fail-with-body --silent --show-error \
  --request POST \
  --url "https://<DOMINIO_DO_DOKPLOY>/api/application.deploy" \
  --header "x-api-key: <API_KEY>" \
  --header "Content-Type: application/json" \
  --data '{"applicationId":"<APPLICATION_ID>","title":"Teste manual"}'
```

Use o ID da Application correta e não grave esse comando com credenciais reais em arquivos versionados ou histórico compartilhado.

### 08.1 Workflow do backend

> **Nota sobre build duplicado:** o workflow executa `docker build` para validar compilação, publicação, Dockerfile, entrypoint e instalação do `dotnet-ef`. Depois, o Dokploy fará outro build ao receber `application.deploy`. A geração e aplicação das migrations ocorre somente no start da imagem implantada, usando o volume `/src/Migrations` e as variáveis reais do destino.

Crie `.github/workflows/backend-ci-cd.yml` com:

```yaml
name: Backend CI/CD

on:
  pull_request:
    paths:
      - "projeto/backend/csharp_p2/**"
      - ".github/workflows/backend-ci-cd.yml"
  push:
    branches: [main]
    paths:
      - "projeto/backend/csharp_p2/**"
      - ".github/workflows/backend-ci-cd.yml"
  workflow_dispatch:
    inputs:
      deploy:
        description: "Executar deploy do backend após o CI"
        required: true
        type: boolean
        default: false

permissions:
  contents: read

concurrency:
  group: backend-production
  cancel-in-progress: false

defaults:
  run:
    working-directory: projeto/backend/csharp_p2

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.0.x"

      - run: dotnet restore csharp_p2.sln
      - run: dotnet build csharp_p2.sln --configuration Release --no-restore

      - name: Tests (the solution currently has no test project)
        run: dotnet test csharp_p2.sln --configuration Release --no-build

      - run: dotnet publish csharp_p2.csproj --configuration Release --no-build --output ./publish

      # Valida o mesmo Dockerfile que será usado pelo Dokploy.
      - run: docker build --tag pizzaria-backend:ci .

  deploy:
    if: >-
      github.ref == 'refs/heads/main' &&
      (github.event_name == 'push' ||
       (github.event_name == 'workflow_dispatch' && inputs.deploy))
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy backend deployment
        env:
          DOKPLOY_URL: ${{ secrets.DOKPLOY_URL }}
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
          APPLICATION_ID: ${{ secrets.DOKPLOY_BACKEND_APPLICATION_ID }}
        shell: bash
        run: |
          set -euo pipefail

          test -n "$DOKPLOY_URL"
          test -n "$DOKPLOY_API_KEY"
          test -n "$APPLICATION_ID"

          curl --fail-with-body --silent --show-error \
            --request POST \
            --url "${DOKPLOY_URL%/}/api/application.deploy" \
            --header "x-api-key: ${DOKPLOY_API_KEY}" \
            --header "Content-Type: application/json" \
            --data "$(printf '{"applicationId":"%s","title":"Backend %s","description":"GitHub Actions CI approved"}' "$APPLICATION_ID" "${GITHUB_SHA:0:7}")"
```

### 08.2 Workflow do frontend

Crie `.github/workflows/frontend-ci-cd.yml` com:

```yaml
name: Frontend CI/CD

on:
  pull_request:
    paths:
      - "projeto/web/angular_p2/**"
      - ".github/workflows/frontend-ci-cd.yml"
  push:
    branches: [main]
    paths:
      - "projeto/web/angular_p2/**"
      - ".github/workflows/frontend-ci-cd.yml"
  workflow_dispatch:
    inputs:
      deploy:
        description: "Executar deploy do frontend após o CI"
        required: true
        type: boolean
        default: false

permissions:
  contents: read

concurrency:
  group: frontend-production
  cancel-in-progress: false

defaults:
  run:
    working-directory: projeto/web/angular_p2

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
          cache-dependency-path: projeto/web/angular_p2/package-lock.json

      - run: npm ci
      - run: npm run lint

      - name: Tests (run when test files exist)
        shell: bash
        run: |
          if find src -type f \( -name '*.spec.ts' -o -name '*.test.ts' \) -print -quit | grep -q .; then
            npm test -- --watch=false
          else
            echo "No Angular test files found; skipping test runner."
          fi

      - run: npm run build -- --configuration production

      # Valida o mesmo Dockerfile que será usado pelo Dokploy.
      - run: docker build --tag pizzaria-frontend:ci .

  deploy:
    if: >-
      github.ref == 'refs/heads/main' &&
      (github.event_name == 'push' ||
       (github.event_name == 'workflow_dispatch' && inputs.deploy))
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy frontend deployment
        env:
          DOKPLOY_URL: ${{ secrets.DOKPLOY_URL }}
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
          APPLICATION_ID: ${{ secrets.DOKPLOY_FRONTEND_APPLICATION_ID }}
        shell: bash
        run: |
          set -euo pipefail

          test -n "$DOKPLOY_URL"
          test -n "$DOKPLOY_API_KEY"
          test -n "$APPLICATION_ID"

          curl --fail-with-body --silent --show-error \
            --request POST \
            --url "${DOKPLOY_URL%/}/api/application.deploy" \
            --header "x-api-key: ${DOKPLOY_API_KEY}" \
            --header "Content-Type: application/json" \
            --data "$(printf '{"applicationId":"%s","title":"Frontend %s","description":"GitHub Actions CI approved"}' "$APPLICATION_ID" "${GITHUB_SHA:0:7}")"
```

## 09. Primeiro deploy

1. Criar os Dockerfiles, `.dockerignore`, Nginx e workflows exatamente como documentado acima; ajustar a URL final da API Angular.
2. Abrir PR e confirmar os checks aplicáveis em verde. Em um PR que altera somente um dos projetos, o workflow do outro projeto pode não ser criado por causa do filtro `paths`.
3. Fazer merge em `main`; acompanhar Actions e confirmar que as chamadas `POST /api/application.deploy` retornam HTTP 2xx.
4. No primeiro start do backend, acompanhar os logs e confirmar a sequência `gerar Initial_* -> database update -> iniciar a API -> seeds`. Falha de geração, migration ou seed deve impedir o container de ficar healthy.
5. No Dokploy, confirmar build e healthcheck verde para backend e frontend.
6. Validar `https://<BACKEND_DOMAIN>/api/health` e carregar `https://<FRONTEND_DOMAIN>`.
7. Testar login, emissão/renovação do CSRF, cookie cross-origin, upload/download e um job Hangfire.
8. Reiniciar o backend; o entrypoint deve informar que o modelo não possui alterações pendentes, `database update` não deve recriar tabelas, e login/sessão, chaves, arquivos e jobs devem continuar válidos.

Os seeds já são executados automaticamente pelo `Program.cs` em cada start e
devem permanecer idempotentes. O endpoint `POST /api/run-seeds` possui
`[AllowAnonymous]`, mas rejeita execução fora de `Development`; ele não participa
do deploy de produção. Revise qualquer novo seed com o mesmo rigor de uma
migration, evitando sobrescrever dados existentes.

Antes de publicar alterações de modelo, faça backup restaurável do PostgreSQL e do volume `/src/Migrations` e confirme compatibilidade backward/forward com a versão anterior. Como a migration é gerada e aplicada no destino, confira o arquivo gerado no volume e os logs imediatamente após o deploy. O fluxo automático é adequado enquanto o backend usa **uma réplica**. Não inicie várias réplicas novas simultaneamente: duas execuções concorrentes podem disputar a geração do snapshot e alterações de DDL. Para escalar horizontalmente, mova esse entrypoint para um runner one-shot dentro da rede do Dokploy e só depois atualize as réplicas da API.

Adote expand/contract para alterações incompatíveis:

1. **Expand:** adicione tabelas/colunas novas de forma compatível, inicialmente nullable ou com default seguro; publique código capaz de operar com schema antigo e novo.
2. Migre/preencha os dados e confirme que nenhuma instância antiga depende da estrutura anterior.
3. **Contract:** somente em uma implantação posterior remova colunas, constraints ou estruturas antigas.

Não renomeie/remova coluna, tabela ou índice utilizado pela versão ainda em execução no mesmo deploy. Para migrations destrutivas ou não reversíveis, exija backup restaurável e aprovação manual antes do merge/deploy; ter apenas um arquivo de backup sem teste de restauração não é suficiente.

## 10. Testes do roteamento CI/CD

> **Branch protection:** como os workflows usam `paths`, um workflow pode não existir naquela execução quando somente o outro componente mudou. Se a branch `main` exigir checks obrigatórios, configure o ruleset de forma compatível com esse modelo e valide um PR somente-backend e outro somente-frontend antes do go-live. Não assuma que ambos os checks path-filtered podem ser marcados como obrigatórios globalmente sem testar.

- Alteração só no backend: apenas Backend CI/CD deve executar e só o backend deve ganhar novo deployment.
- Alteração só no frontend: apenas Frontend CI/CD deve executar e só o frontend deve ganhar novo deployment.
- Introduzir falha temporária em branch/PR: CI deve falhar e nenhuma chamada de deploy à API deve ocorrer.
- Alterar ambos: dois CIs e, após aprovação individual, dois deploys.
- `workflow_dispatch`: executa somente o CI por padrão. Para também implantar em produção, selecione explicitamente `deploy: true` e execute o workflow a partir da branch `main`.

## 11. Rollback e indisponibilidade

1. Identifique no Dokploy o último deployment saudável do componente afetado.
2. Use Redeploy/Rollback dessa revisão; não reverta banco automaticamente.
3. Valide o healthcheck e o fluxo funcional.
4. Se a versão anterior não for compatível com o schema atual, mantenha a versão nova, restaure o backup apenas em incidente aprovado, ou publique uma correção forward.

Para reduzir downtime, mantenha healthchecks obrigatórios. Use rolling update com duas ou mais réplicas somente depois que arquivos e estado estiverem fora do filesystem efêmero, Hangfire/Redis estiverem compartilhados e as migrations tiverem sido separadas em um job one-shot. Com migration no entrypoint e uma réplica, aceite uma curta janela durante a atualização.

## 12. Logs, backup e diagnóstico

- GitHub Actions: falha de restore/lint/test/build ou status HTTP da API do Dokploy.
- Dokploy: logs de build, deployment, healthcheck e container.
- Backend: logs de console; verificar conexão PostgreSQL/Valkey, `TRUSTED_PROXIES`, CORS/CSRF e permissões em `/data/files`.
- Frontend: verificar se o bundle contém a URL final correta e se chamadas retornam cookies/CORS esperados.
- Backup: automatizar dump do PostgreSQL, testar restauração e manter retenção fora da VPS; para arquivos locais, copiar o volume `/data/files`; incluir Valkey somente se jobs/chaves precisarem recuperação operacional.

---

## 13. Pontos verificados na documentação oficial

Na revisão deste runbook, foi confirmado na documentação oficial atual do Dokploy que:

- Applications podem ser disparadas pela API `POST /api/application.deploy`;
- essa rota exige autenticação pelo header `x-api-key`;
- o corpo aceita `applicationId` e também permite `title`/`description`;
- Dokploy continua oferecendo Auto Deploy/webhooks, mas este runbook mantém Auto Deploy por push desativado para preservar a ordem **CI aprovado -> CD**.
- Environments diferentes são isolados e podem possuir variáveis compartilhadas próprias;
- aplicações devem usar **Internal Credentials** para acessar bancos no mesmo ambiente/rede, sem External Port;
- PostgreSQL e Redis são recursos nativos de Database, e a imagem Docker desses recursos pode ser customizada;
- named volumes são a opção indicada quando o dado precisa do mecanismo de Volume Backup;
- backups lógicos de Database usam um destino S3, agendamento e teste pela aba Backup.

Referências oficiais consultadas:

- `https://docs.dokploy.com/docs/core/multi-tenancy`
- `https://docs.dokploy.com/docs/core/databases`
- `https://docs.dokploy.com/docs/core/databases/connection`
- `https://docs.dokploy.com/docs/core/databases/backups`
- `https://docs.dokploy.com/docs/core/volume-backups`
- `https://docs.dokploy.com/docs/core/deployment-options`

A configuração deve ser validada novamente caso a versão instalada do Dokploy seja atualizada de forma relevante.

## 14. Checklist operacional

- [ ] Domínios e DNS definidos, HTTPS válido.
- [ ] Auto Deploy por push desativado no Dokploy.
- [ ] `DOKPLOY_URL`, `DOKPLOY_API_KEY` e IDs das duas Applications cadastrados como GitHub Actions Secrets.
- [ ] PostgreSQL, Valkey, backend e frontend estão no mesmo Project, Environment e Server.
- [ ] Backend usa os Internal Hosts fornecidos pelo Dokploy; nenhum host interno está como `localhost`.
- [ ] PostgreSQL/Valkey sem External Port, com volumes persistentes em `/var/lib/postgresql/data` e `/data`.
- [ ] Valkey validado com autenticação, AOF `everysec` e política `noeviction`.
- [ ] Variáveis do backend preenchidas sem secrets no Git.
- [ ] `environment.ts` aponta para o domínio real da API.
- [ ] Volume `/data/files` criado ou Cloudinary configurado.
- [ ] Alteração de modelo revisada antes do merge e migration gerada conferida no volume/log após o deploy.
- [ ] Alterações incompatíveis planejadas em etapas expand/contract.
- [ ] Backup restaurável e testado antes de migration destrutiva ou não reversível.
- [ ] Volume persistente exclusivo montado em `/src/Migrations` e incluído no backup.
- [ ] EntryPoint gerou/validou as migrations e executou `database update` antes da API iniciar.
- [ ] Backend mantido em uma réplica enquanto migrations forem executadas no entrypoint.
- [ ] CI de backend e frontend verde antes de CD.
- [ ] Healthchecks e testes funcionais aprovados.
- [ ] Backup e restauração testados.
- [ ] Rollback de cada Application ensaiado.
