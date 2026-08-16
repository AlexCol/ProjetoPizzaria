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
- secrets longos e aleatórios para `CRYPTO_SECRET`, `ADMIN_PASSWORD` e `FILE_MANAGER_SECRET_KEY` quando aplicável;
- proxies confiáveis conforme a rede do Dokploy.

Antes do build, trocar `apiBaseUrl` em `projeto/web/angular_p2/src/environments/environment.ts` de `https://api.meusite.com/api` para `https://<BACKEND_DOMAIN>/api`. Esse valor é compilado no bundle e não é variável runtime do container.

## 05. Criar a infraestrutura no Dokploy

1. No mesmo Project/Environment das Applications, crie PostgreSQL e Valkey para que compartilhem a rede interna.
2. Não publique as portas 5432 ou 6379 na internet.
3. Habilite volume persistente do PostgreSQL e volume de dados do Valkey/AOF conforme a tela da versão instalada.
4. Anote os hostnames internos fornecidos pelo Dokploy; eles serão `DB_HOST` e `CACHE_HOST`.
5. Restrinja credenciais a esse ambiente e configure backup antes do go-live.

O PostgreSQL é obrigatório. Para produção, este runbook escolhe `CACHE_TYPE=Valkey` e `HANGFIRE_STORAGE_TYPE=Redis`. A persistência do Valkey não é necessária apenas por causa do cache: cache pode ser descartável, mas Data Protection e Hangfire armazenam estado operacional cuja perda pode invalidar cookies/chaves ou perder jobs. Por isso, trate a persistência do Valkey como necessária enquanto esses recursos dependerem dele.

## 06. Application do backend

### 06.1 Criar os arquivos de containerização

O `start.sh` existente é exclusivo do ambiente de desenvolvimento e **não deve ser usado como entrypoint no Dokploy**. Ele exige um `.env` físico, sobe PostgreSQL e Valkey com Docker Compose, executa `dotnet format`, aplica migrations e inicia `dotnet run`. No Dokploy, banco e cache já são serviços separados; dar acesso ao Docker da VPS para o container também seria um risco desnecessário.

Em produção, reaproveite somente a intenção de `dotnet ef database update`: o Dockerfile abaixo gera um EF Core migration bundle durante o build. A imagem executa esse bundle antes de iniciar a API. Assim, o mesmo `docker build` validado pelo GitHub Actions comprova que aplicação e migrations podem ser empacotadas, e o acesso ao banco permanece restrito à rede interna do Dokploy.

Crie `projeto/backend/csharp_p2/Dockerfile` com:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src
COPY . .
# Evita que artefatos locais Windows em bin/obj contaminem o build Linux,
# mesmo se o .dockerignore ainda não tiver sido criado corretamente.
RUN rm -rf bin obj \
    && dotnet restore csharp_p2.csproj \
    && dotnet publish csharp_p2.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false
RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.11
# O bundle precisa criar o DbContext durante o build, mas não conecta nesse banco fictício.
RUN ASPNETCORE_ENVIRONMENT=Development \
    DB_TYPE=Postgres \
    DB_HOST=localhost \
    DB_PORT=5432 \
    DB_USER=build \
    DB_PASS=build \
    DB_NAME=build \
    /tools/dotnet-ef migrations bundle \
      --project csharp_p2.csproj \
      --startup-project csharp_p2.csproj \
      --context csharp_p2.src.Modules.Infra.Database.BaseDBContext \
      --configuration Release \
      --self-contained \
      --target-runtime linux-musl-x64 \
      --output /app/publish/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
RUN mkdir -p /app/Log /data/files \
    && chown -R app:app /app /data
COPY --from=build --chown=app:app /app/publish .
USER app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "-c", "/app/efbundle && exec dotnet /app/csharp_p2.dll"]
```

Crie `projeto/backend/csharp_p2/.dockerignore` com:

```text
bin/
obj/
.git/
.env
.env.*
Log/
docker/
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

O `docker build` também deve falhar se o migration bundle não puder ser gerado. Não remova essa validação do CI. O bundle usa as variáveis reais do Dokploy somente quando o container inicia e registra migrations aplicadas na tabela `__EFMigrationsHistory`.

As variáveis fictícias usadas no `RUN ... migrations bundle` servem exclusivamente para o EF Core instanciar o `BaseDBContext` em design-time; elas não são credenciais e não acessam o banco de produção. Se a inicialização do backend passar a exigir outro serviço ou variável obrigatória, revise esse bloco e repita o `docker build`: mudanças em `EnvConfig`, `BuilderConfig` ou na criação do DbContext podem tornar insuficiente o conjunto atual.

> **Validação da imagem Alpine:** o Dockerfile usa imagens .NET Alpine. Antes do go-live, execute os principais fluxos funcionais dentro dessa imagem, especialmente recursos que possam depender de bibliotecas nativas. Se alguma dependência exigir glibc ou outra biblioteca ausente no Alpine, troque as imagens `*-alpine` pelas imagens Debian-based equivalentes do .NET e repita os testes.

### 06.2 Configurar a Application

Configure:

| Campo | Valor |
|---|---|
| Name | `pizzaria-backend` |
| Provider/repository/branch | GitHub / `AlexCol/ProjetoPizzaria` / `main` |
| Build type | Dockerfile |
| Build path/context | `projeto/backend/csharp_p2` |
| Dockerfile | `Dockerfile` |
| Container port | `8080` |
| Domain | `<BACKEND_DOMAIN>`, HTTPS ativo |
| Healthcheck | HTTP `GET /api/health`, porta 8080 |
| Watch path | `projeto/backend/csharp_p2/**` (opcional; não é usado como controle principal com Auto Deploy desativado) |
| Auto Deploy | desativado |
| Restart | on-failure/always |

Variáveis (preencher secrets no Dokploy, nunca no Git):

```dotenv
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
FRONTEND_URL=https://<FRONTEND_DOMAIN>
ALLOWED_HOSTS=<BACKEND_DOMAIN>
TRUSTED_PROXIES=<DEFINIR_HOSTS_OU_REDES_DO_PROXY_DOKPLOY>
ADMIN_EMAIL=<DEFINIR>
ADMIN_PASSWORD=<SECRET>
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

Para armazenamento local, monte um volume persistente em `/data/files`. Opcionalmente monte outro em `/app/Log`; os logs de console devem ser a fonte primária no Dokploy.

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

No Dokploy, gere uma API key com permissão suficiente para disparar deploy das Applications. No GitHub, abra:

```text
Repository
  -> Settings
  -> Secrets and variables
  -> Actions
  -> New repository secret
```

Cadastre:

```text
DOKPLOY_URL=https://<DOMINIO_DO_DOKPLOY>
DOKPLOY_API_KEY=<SECRET>
DOKPLOY_BACKEND_APPLICATION_ID=<ID_DA_APPLICATION_BACKEND>
DOKPLOY_FRONTEND_APPLICATION_ID=<ID_DA_APPLICATION_FRONTEND>
```

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

> **Nota sobre build duplicado:** o workflow executa `docker build` para validar a imagem e gerar o migration bundle antes do CD. Depois, o Dokploy fará um novo build ao receber `application.deploy`. Isso é intencional: o primeiro build valida aplicação, Dockerfile e migrations; o segundo gera a imagem efetivamente implantada pelo Dokploy.

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
4. No primeiro start do backend, acompanhar os logs e confirmar que o `efbundle` concluiu antes de `csharp_p2.dll` iniciar. Falha de migration deve impedir o container de ficar healthy.
5. No Dokploy, confirmar build e healthcheck verde para backend e frontend.
6. Validar `https://<BACKEND_DOMAIN>/api/health` e carregar `https://<FRONTEND_DOMAIN>`.
7. Testar login, emissão/renovação do CSRF, cookie cross-origin, upload/download e um job Hangfire.
8. Reiniciar o backend; o bundle deve informar que não há migrations pendentes, e login/sessão, chaves, arquivos e jobs devem continuar válidos.

Não execute seeds automaticamente no deploy. O endpoint `POST /api/run-seeds` possui `[AllowAnonymous]`, mas o próprio código rejeita sua execução fora de `Development`; portanto, ele não é um mecanismo de seed de produção. Caso dados iniciais sejam necessários, crie uma operação administrativa autenticada ou uma migration idempotente específica, com revisão prévia.

Antes de publicar alterações de schema, revise a migration do commit, faça backup e confirme compatibilidade backward/forward com a versão anterior. O fluxo automático é adequado enquanto o backend usa **uma réplica**. Não inicie várias réplicas novas simultaneamente com migrations pendentes: embora o EF controle `__EFMigrationsHistory`, duas execuções concorrentes podem disputar alterações de DDL. Para escalar horizontalmente, mova o bundle para um job one-shot dentro da rede do Dokploy e só depois acione `application.deploy`.

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

A configuração deve ser validada novamente caso a versão instalada do Dokploy seja atualizada de forma relevante.

## 14. Checklist operacional

- [ ] Domínios e DNS definidos, HTTPS válido.
- [ ] Auto Deploy por push desativado no Dokploy.
- [ ] `DOKPLOY_URL`, `DOKPLOY_API_KEY` e IDs das duas Applications cadastrados como GitHub Actions Secrets.
- [ ] PostgreSQL/Valkey internos, sem portas públicas, com persistência.
- [ ] Variáveis do backend preenchidas sem secrets no Git.
- [ ] `environment.ts` aponta para o domínio real da API.
- [ ] Volume `/data/files` criado ou Cloudinary configurado.
- [ ] Migration do commit revisada antes do merge quando houver alteração de schema.
- [ ] Alterações incompatíveis planejadas em etapas expand/contract.
- [ ] Backup restaurável e testado antes de migration destrutiva ou não reversível.
- [ ] Migration bundle gerado pelo Docker build e aplicado antes da API iniciar.
- [ ] Backend mantido em uma réplica enquanto migrations forem executadas no entrypoint.
- [ ] CI de backend e frontend verde antes de CD.
- [ ] Healthchecks e testes funcionais aprovados.
- [ ] Backup e restauração testados.
- [ ] Rollback de cada Application ensaiado.
