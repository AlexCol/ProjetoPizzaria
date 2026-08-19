# Orval no Angular

Este projeto usa o Orval para ler o contrato OpenAPI/Swagger do backend e gerar automaticamente:

- interfaces e tipos TypeScript para requests e responses;
- services Angular injetáveis;
- chamadas HTTP tipadas usando o `HttpClient`;
- arquivos separados de acordo com as tags do OpenAPI.

Os arquivos são gerados em `src/api/generated`. Não edite manualmente essa pasta, porque o conteúdo pode ser apagado e recriado na próxima execução do Orval.

## Pré-requisitos

- aplicação Angular já criada;
- backend expondo um documento OpenAPI em JSON ou YAML;
- Node.js e npm instalados;
- backend em execução quando o contrato for lido por uma URL local.

Neste projeto, o contrato está disponível em:

```text
http://localhost:3300/swagger/v1.json
```

O Orval acessa essa URL durante a geração. Ele não é necessário em tempo de execução no navegador e, por isso, deve ser instalado como dependência de desenvolvimento.

## 1. Instalação

Execute na raiz do projeto Angular, onde está o `package.json`:

```bash
npm install --save-dev orval
```

## 2. Configuração

Crie o arquivo `orval.config.ts` na raiz do projeto Angular:

```ts
import { defineConfig } from 'orval';

export default defineConfig({
  pizzaria: {
    input: {
      target: 'http://localhost:3300/swagger/v1.json',
    },
    output: {
      client: 'angular',
      mode: 'tags-split',

      target: 'src/api/generated/pizzaria.ts',
      schemas: 'src/api/generated/models',

      clean: true,

      override: {
        angular: {
          provideIn: 'root',
          retrievalClient: 'httpClient',
        },
      },
    },
  },
});
```

### Principais opções

- `input.target`: endereço ou caminho do documento OpenAPI.
- `client: 'angular'`: gera services compatíveis com o `HttpClient` do Angular.
- `mode: 'tags-split'`: separa os services com base nas tags declaradas no OpenAPI.
- `target`: define o diretório e o nome-base dos arquivos de endpoints.
- `schemas`: diretório dos tipos, interfaces e enums gerados.
- `clean: true`: limpa os arquivos gerados anteriormente antes de gerar novamente.
- `provideIn: 'root'`: torna os services gerados disponíveis pelo sistema de injeção de dependência do Angular.
- `retrievalClient: 'httpClient'`: gera métodos tradicionais que retornam `Observable`.

### Modos de leitura do Angular

O campo `retrievalClient` pode receber:

- `httpClient`: gera services com `HttpClient` e `Observable`. É o padrão usado neste projeto.
- `httpResource`: gera funções reativas baseadas em signals e `httpResource` para operações de leitura.
- `both`: gera services com `HttpClient` e também recursos reativos para leitura.

Para gerar as duas abordagens:

```ts
override: {
  angular: {
    provideIn: 'root',
    retrievalClient: 'both',
  },
},
```

## 3. Scripts do npm

Adicione ao campo `scripts` do `package.json`:

```json
{
  "scripts": {
    "api:generate": "orval --config orval.config.ts",
    "api:watch": "orval --config orval.config.ts --watch"
  }
}
```

Para gerar uma vez:

```bash
npm run api:generate
```

Para observar alterações no contrato e gerar novamente:

```bash
npm run api:watch
```

Quando `input.target` é uma URL local, inicie o backend antes de executar esses comandos.

## 4. Configuração do ESLint

Esta etapa só é necessária quando o projeto usa ESLint com análise TypeScript baseada em projeto, por exemplo, com `projectService: true`.

O arquivo `orval.config.ts` não pertence ao build da aplicação Angular e normalmente não está incluído no `tsconfig.app.json`. Para permitir que o ESLint analise esse arquivo, configure `allowDefaultProject` no `eslint.config.mjs`:

```js
languageOptions: {
  parserOptions: {
    projectService: {
      allowDefaultProject: ['orval.config.ts'],
    },
    tsconfigRootDir: import.meta.dirname,
  },
},
```

Isso corrige o erro:

```text
Parsing error: orval.config.ts was not found by the project service
```

Também é recomendável ignorar os arquivos gerados. Eles são produzidos por uma ferramenta e não devem precisar seguir as regras manuais do projeto:

```js
{
  ignores: [
    '.angular/**',
    'coverage/**',
    'dist/**',
    'node_modules/**',
    'src/api/generated/**',
  ],
},
```

Não adicione `orval.config.ts` ao `tsconfig.app.json`: ele é um arquivo executado pelo Node/Orval e não faz parte do bundle Angular.

## 5. Disponibilizar o HttpClient

Os services gerados dependem do `HttpClient`. Em uma aplicação Angular standalone, ele deve estar registrado nos providers:

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const httpClientConfig = provideHttpClient(withInterceptors([apiBaseInterceptor]));
```

Este projeto já faz esse registro em `src/app/providers/non-visual/httpClient.ts`.

## 6. Usar um service gerado

Os nomes dos arquivos, services e métodos dependem principalmente das tags e dos `operationId` definidos no contrato OpenAPI. Depois da geração, importe o service correspondente a partir de `src/api/generated`:

```ts
import { Component, inject } from '@angular/core';
import { UsersService } from '../../../api/generated/users/users.service';

@Component({
  selector: 'app-users',
  template: '',
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);

  carregarUsuarios(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => console.log(users),
      error: (error) => console.error(error),
    });
  }
}
```

O exemplo é ilustrativo. Consulte os arquivos efetivamente gerados para saber os nomes produzidos a partir do contrato deste backend.

## 7. URL base e interceptor

O Orval preserva os caminhos definidos no OpenAPI. Se o contrato contém `/api/users`, o método gerado também chamará `/api/users`.

Neste projeto, o `apiBaseInterceptor` adiciona `environment.apiBaseUrl`, cujo valor de desenvolvimento já termina em `/api`. Sem um tratamento adicional, uma rota gerada pode ficar duplicada:

```text
http://localhost:3300/api/api/users
```

Enquanto services manuais que chamam `/users` coexistirem com services gerados que chamam `/api/users`, o interceptor pode aceitar os dois formatos:

```ts
const apiBaseUrl = environment.apiBaseUrl;
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

const url = req.url.startsWith('/api/') ? `${apiOrigin}${req.url}` : `${apiBaseUrl}${req.url}`;

const apiRequest = req.clone({
  url,
  withCredentials: true,
  setHeaders: headers,
});
```

Quando toda a aplicação estiver usando um único padrão de rotas, essa compatibilidade pode ser simplificada.

## 8. Fluxo de trabalho recomendado

Sempre que endpoints, DTOs ou respostas do backend forem alterados:

1. inicie o backend;
2. confirme que o documento OpenAPI abre no endereço configurado;
3. execute `npm run api:generate`;
4. revise as alterações em `src/api/generated`;
5. execute `npm run lint` e `npm run build`;
6. ajuste o código consumidor se o contrato tiver sofrido alguma mudança incompatível.

## Problemas comuns

### Não foi possível acessar o Swagger

Confirme se o backend está rodando e se `input.target` abre diretamente no navegador. Como a leitura é feita pelo processo Node do Orval, CORS do navegador normalmente não interfere na geração.

### Nenhum service ou método esperado foi gerado

Confira as tags e os `operationId` do documento OpenAPI. Eles influenciam a separação dos arquivos e os nomes gerados.

### Imports apontam para nomes diferentes dos exemplos

Os exemplos deste documento são genéricos. Use os exports que estiverem presentes em `src/api/generated` depois de executar o gerador.

### Alterações manuais desapareceram

Com `clean: true`, o diretório gerado é recriado. Coloque interceptors, helpers, wrappers e regras de negócio fora de `src/api/generated`.
