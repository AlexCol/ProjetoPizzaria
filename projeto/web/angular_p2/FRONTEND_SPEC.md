# Especificação do frontend Angular — Projeto Pizzaria P2

## 1. Objetivo

Criar em `projeto/web/angular_p2` uma aplicação Angular standalone, strict, responsiva e orientada a funcionalidades, consumindo a API ASP.NET Core localizada em `projeto/backend/csharp_p2`.

O sistema cobre autenticação, usuários e perfis, categorias, produtos com imagem, pedidos, itens de pedido, arquivos e atualizações em tempo real por SSE.

## 2. Visão do backend analisado

- ASP.NET Core em `.NET 10`.
- Entity Framework Core com suporte configurado para PostgreSQL e Oracle.
- Redis para cache e armazenamento das sessões.
- Autenticação própria por sessão; no navegador o token fica no cookie HTTP-only `session_token`.
- Política global: todo endpoint exige autenticação, exceto os marcados como anônimos.
- Papel administrativo reconhecido pelo texto exato `Admin`.
- Hangfire para tarefas em segundo plano, inclusive e-mails.
- Armazenamento de imagens/arquivos por serviço externo configurável.
- Swagger/OpenAPI disponível no backend.
- Respostas JSON usam camelCase por padrão do ASP.NET Core.

## 3. Regras obrigatórias de integração HTTP

### 3.1 URL e environments

Criar `environment.ts` e `environment.production.ts` com `apiUrl`, sem espalhar URLs nos serviços. A URL concreta do backend deve ser definida no ambiente local.

O backend precisa receber `FRONTEND_URL` com a origem exata do Angular, pois o CORS aceita credenciais somente para origens permitidas.

### 3.2 Headers e cookies

Em todas as chamadas da aplicação web:

- enviar o header `app-origin: web`;
- usar `withCredentials: true`, para enviar/receber `session_token`;
- no login, enviar também `remember-me: true|false`;
- não tentar ler ou persistir `session_token`: ele é HTTP-only;
- não usar `Authorization` no fluxo web. Esse header é destinado ao token do aplicativo mobile.

Implementar isso em um `HttpInterceptorFn`. O interceptor também deve normalizar erros no formato `ErrorResponse { message: string[] }`.

O cookie é `Secure` e `SameSite=None` em produção; em desenvolvimento é `SameSite=Lax`. Portanto, frontend e API devem usar HTTPS em produção.

### 3.3 Sessão

- Ao iniciar a aplicação, chamar `GET /api/auth/session` para reidratar o usuário.
- Manter o payload apenas em memória (Signal/store), não em `localStorage`.
- Em `401`, limpar o estado e redirecionar para `/login`, preservando uma `returnUrl` segura.
- Em `403`, mostrar acesso negado sem apagar uma sessão ainda válida.
- O backend renova a sessão/cookie por middleware; o frontend só precisa continuar enviando credenciais.

## 4. Contratos TypeScript principais

Criar modelos equivalentes aos seguintes contratos. IDs `long` podem ser `number` enquanto permanecerem abaixo de `Number.MAX_SAFE_INTEGER`; se o gerador Snowflake ultrapassar esse limite, migrar os IDs da aplicação para `string`.

```ts
type Id = number;

interface BaseEntity { id: Id; createdAt: string; updatedAt: string; }
interface MessageResponse { message: string; }
interface ErrorResponse { message: string[]; }
interface UserSessionPayload { user: UserResponse; }

enum UserStatus { Inactive = 'I', Active = 'A', Blocked = 'B' }
enum ProductStatus { Active = 'A', Inactive = 'I' }
enum OrderStatus { Draft = 'D', Pending = 'P', Done = 'O' }

interface RoleResponse { id: Id; name: string; }
interface UserResponse {
  id: Id; email: string; name: string; status: UserStatus;
  roleId: Id | null; role: RoleResponse | null;
}
interface Category extends BaseEntity { name: string; }
interface Product extends BaseEntity {
  name: string; price: number; description: string; banner: string | null;
  status: ProductStatus; categoryId: Id; category: Category | null;
}
interface OrderItem extends BaseEntity {
  amount: number; orderId: Id; productId: Id; product: Product | null;
}
interface Order extends BaseEntity {
  tableNumber: number; status: OrderStatus; name: string | null;
  userId: Id; orderItems: OrderItem[];
}

interface PaginatedResult<T> {
  data: readonly T[]; total: number; page: number; limit: number;
}
interface FilterCriteria {
  field: string; value: unknown; operator: '='|'!='|'>'|'<'|'>='|'<='|'in'|'like';
  isNegated: boolean;
}
interface SortCriteria { field: string; order: 'asc'|'desc'; }
interface SearchCriteria {
  where?: FilterCriteria[]; sort?: SortCriteria[];
  pagination?: { page: number; limit: number };
}
```

DTOs de escrita:

- `LoginRequest`: `email`, `password`.
- `CategoryRequest` e `RoleRequest`: `name`.
- `CreateUserRequest`: `email`, `password`, `confirmPassword`, `name`, `roleId`.
- `UpdateUserRequest`: `name`, `roleId`.
- `EmailRequest`: `email`.
- `RecoverPasswordRequest`: `password`, `confirmPassword`.
- `CreateProductRequest`: `name`, `price`, `description`, `categoryId`.
- `UpdateProductRequest`: campos opcionais `name`, `price`, `description`, `categoryId`, `status`.
- `CreateOrderRequest`: `tableNumber`, `name`, `orderItems`.
- Item na criação: `amount`, `orderId`, `productId`; o `orderId` é redundante para um pedido novo e deve ser confirmado com o backend.
- `UpsertOrderItemRequest`: `amount`, `productId`.
- `UpdateOrderStatusRequest`: `status`.

## 5. Catálogo de endpoints

`Auth`:

| Método | Rota | Acesso | Uso no frontend |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Login web; JSON + headers `app-origin` e `remember-me` |
| GET | `/api/auth/session` | Autenticado | Reidratar sessão |
| POST | `/api/auth/logout` | Autenticado | Encerrar sessão atual; retorna 204 |
| POST | `/api/auth/logout/all` | Autenticado | Encerrar todas as sessões do usuário; retorna 204 |
| POST | `/api/auth/logout/all-users` | Admin | Revogar todas as sessões; retorna 204 |
| POST | `/api/auth/login-app` | Público/mobile | Não usar no Angular web |

`Usuários`:

| Método | Rota | Acesso | Corpo/retorno |
|---|---|---|---|
| GET | `/api/users` | Autenticado | Lista de `UserResponse` |
| GET | `/api/users/{id}` | Autenticado | `UserResponse` |
| GET | `/api/users/search` | Autenticado | Busca paginada por query |
| POST | `/api/users` | Admin | `CreateUserRequest` |
| PATCH | `/api/users` | Autenticado | Atualiza o usuário da sessão com `UpdateUserRequest` |
| POST | `/api/users/activate/{token}` | Público | Ativação recebida por e-mail |
| POST | `/api/users/resend-activation-email` | Público | `EmailRequest` |
| POST | `/api/users/send-password-reset-email` | Público | `EmailRequest` |
| POST | `/api/users/recover-password/{token}` | Público | `RecoverPasswordRequest` |

`Perfis`:

| Método | Rota | Acesso | Observação |
|---|---|---|---|
| GET | `/api/roles` | Autenticado | Lista simples |
| GET | `/api/roles/{id}` | Autenticado | Detalhe |
| GET | `/api/roles/search` | Autenticado | Filtros por query |
| POST | `/api/roles/search` | Autenticado | Filtros complexos no corpo |
| POST | `/api/roles` | Admin | Criar |
| PATCH | `/api/roles/{id}` | Admin | Alterar |
| DELETE | `/api/roles/{id}` | Admin | Excluir; retorna 204 |

`Categorias e produtos`:

| Método | Rota | Acesso | Observação |
|---|---|---|---|
| GET | `/api/categories` | Autenticado | Lista |
| GET | `/api/categories/{id}` | Autenticado | Detalhe |
| POST | `/api/categories` | Admin | Criar |
| PATCH | `/api/categories/{id}` | Admin | Alterar |
| DELETE | `/api/categories/{id}` | Admin | Excluir; retorna 204 |
| GET | `/api/products?status=A|I` | Autenticado | Lista opcionalmente por status |
| GET | `/api/products/{id}` | Autenticado | Detalhe |
| GET | `/api/products/search` | Autenticado | Busca paginada por query |
| POST | `/api/products` | Admin | `multipart/form-data`: campos do DTO + arquivo `image` |
| PATCH | `/api/products/{id}` | Admin | `multipart/form-data`: campos alterados + `image` opcional |
| DELETE | `/api/products/{id}` | Admin | Impedido se o produto participa de pedido |

Para exibir o banner, usar `GET /api/file/view?modulePath=products&fileName={banner}`. `GET /api/file/download` exige sessão. Nunca concatenar parâmetros sem `HttpParams`/codificação.

`Pedidos e itens`:

| Método | Rota | Acesso | Observação |
|---|---|---|---|
| GET | `/api/orders` | Autenticado | `PaginatedResult<Order>` com filtros por query |
| GET | `/api/orders/{id}` | Autenticado | Pedido com itens |
| POST | `/api/orders` | Autenticado | Criar em status `Draft` |
| PATCH | `/api/orders/status/{id}` | Autenticado | Alterar somente o status |
| DELETE | `/api/orders/{id}` | Autenticado | Excluir |
| GET | `/api/orderitems/{orderId}` | Autenticado | Itens do pedido |
| POST | `/api/orderitems/{orderId}` | Autenticado | Upsert de uma lista de itens |
| DELETE | `/api/orderitems/{orderItemId}` | Autenticado | Excluir item |

`SSE`:

- `GET /api/sse/connect`: conexão autenticada para eventos em tempo real.
- Eventos declarados: `SessionRevoked`, `SessionUpdated`, `UserSessionsRevoked`, `AllSessionsRevoked`, `SystemNotification` e `OrderStatusChanged`.
- Endpoints de status, envio manual e remoção de conexão são administrativos e podem ficar fora do MVP.
- `EventSource` nativo envia cookies, mas não permite headers personalizados. Como o backend exige `app-origin: web` também nas rotas protegidas, validar a conexão no início da implementação. Se necessário, usar cliente SSE baseado em `fetch` ou dispensar esse header especificamente no endpoint SSE.

Endpoints `/api/test-*`, `/api/run-seeds` e `/api/health` são operacionais/de desenvolvimento e não devem aparecer na interface de negócio.

## 6. Serialização de filtros

Para endpoints `[FromQuery] SearchCriteriaRequest<T>`, serializar chaves no padrão de model binding do ASP.NET Core:

```text
where[0].field=Name
where[0].operator=like
where[0].value=pizza
where[0].isNegated=false
sort[0].field=Name
sort[0].order=asc
pagination.page=1
pagination.limit=20
```

Regras do backend:

- página mínima: 1;
- limite: 1 a 200;
- ordenação: `asc` ou `desc`;
- operadores: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `like`;
- nomes dos campos precisam coincidir com propriedades C# (`Name`, `Status`, etc.). Criar um mapper explícito entre campos da UI e campos da API.

## 7. Arquitetura Angular proposta

Usar componentes standalone, Signals para estado local/global pequeno, Reactive Forms e lazy loading por funcionalidade.

```text
src/app/
  core/
    auth/              auth.service, session.store, auth.guard, admin.guard
    http/              api.interceptor, error handling, query serializer
    layout/            shell, header, sidebar
    realtime/          sse.service
  shared/
    models/            contratos e enums
    ui/                tabela, paginação, confirmação, empty/loading/error states
    validators/        senha, confirmação, arquivo
    pipes/             moeda, status, URL de banner
  features/
    auth/              login, ativação, esqueci/recuperar senha
    dashboard/
    orders/            lista/kanban, criação, detalhe e edição de itens
    products/          lista, formulário e detalhe
    categories/        lista e formulário
    users/             lista, criação e perfil próprio
    roles/             lista e formulário
  app.routes.ts
```

Serviços de API: `AuthService`, `UsersService`, `RolesService`, `CategoriesService`, `ProductsService`, `OrdersService`, `OrderItemsService`, `FilesService` e `SseService`. Cada serviço deve ser pequeno, tipado e retornar `Observable<T>`; estado e efeitos visuais ficam fora dos serviços HTTP.

## 8. Rotas e telas

Rotas públicas:

- `/login`;
- `/ativacao?token=...`;
- `/esqueci-senha`;
- `/recuperar-senha?token=...`.

Rotas autenticadas:

- `/dashboard`;
- `/pedidos`, `/pedidos/novo`, `/pedidos/:id`;
- `/produtos`;
- `/perfil`.

Rotas administrativas:

- `/produtos/novo`, `/produtos/:id/editar`;
- `/categorias`;
- `/usuarios`, `/usuarios/novo`;
- `/perfis`.

O menu deve ser derivado da sessão e esconder ações administrativas quando `session.user.role?.name !== 'Admin'`. O `adminGuard` continua obrigatório; esconder o menu não é controle de acesso.

## 9. Regras de formulário e negócio

- E-mail obrigatório e válido.
- Senha: mínimo de 8 caracteres, ao menos uma maiúscula, uma minúscula, um número e um símbolo; confirmação deve coincidir.
- Usuário: nome entre 3 e 255 caracteres e perfil obrigatório na criação.
- Categoria/perfil: nome obrigatório, máximo de 100 caracteres.
- Produto: nome de 1 a 100, preço maior que zero, descrição de 1 a 500 e categoria positiva/obrigatória.
- Upload de produto deve usar `FormData`; não definir manualmente o header `Content-Type`.
- Pedido: mesa obrigatória; impedir quantidades iguais ou menores que zero na UI.
- Transições permitidas: `Draft -> Pending`, `Pending -> Done|Draft`, `Done -> Pending`.
- Alterações dos detalhes e itens devem ficar disponíveis apenas enquanto o pedido estiver em `Draft`.
- Exibir mensagens retornadas pelo backend, mas manter textos amigáveis para falhas de rede, 401, 403 e 500.

## 10. Experiência mínima esperada

- Estados explícitos de carregamento, vazio, erro e sucesso.
- Confirmação antes de exclusões, logout global e mudanças destrutivas.
- Tabelas responsivas com paginação no servidor, busca com debounce e filtros persistidos na URL.
- Valores monetários em `pt-BR`/BRL e datas convertidas de UTC para o fuso do navegador.
- Imagens com placeholder e tratamento de erro.
- Pedidos podem começar como lista; um quadro por status é uma evolução natural.
- Acessibilidade: labels reais, foco após erro, navegação por teclado e contraste adequado.

## 11. Sequência de implementação

1. Gerar o workspace Angular standalone, routing, SCSS e strict.
2. Configurar environments, interceptor, contratos, tratamento de erros e serializador de busca.
3. Implementar login, reidratação da sessão, logout e guards.
4. Criar shell responsivo e navegação baseada em papel.
5. Implementar categorias e produtos, incluindo `FormData` e banner.
6. Implementar pedidos e itens com regras de status.
7. Implementar usuários, perfil próprio e perfis administrativos.
8. Integrar SSE e reações a sessão revogada/status do pedido.
9. Adicionar testes unitários de guards, interceptor, validators e serialização; testes de integração dos fluxos críticos.

## 12. Pontos que exigem decisão ou ajuste no backend

1. `IOrdersService` possui atualização de mesa/nome, mas `OrdersController` não expõe endpoint para essa operação. O frontend não conseguirá editar esses dados até a API disponibilizá-lo.
2. `CreateOrderItemsDto` exige `orderId`, embora o pedido ainda não exista na criação. Confirmar se o campo pode ser omitido/zero ou removê-lo do DTO.
3. A API permite a qualquer usuário autenticado consultar usuários, perfis e possivelmente pedidos de outros usuários. Confirmar a regra de autorização pretendida.
4. `PATCH /api/users` recebe `roleId` na atualização do próprio usuário. Confirmar se um usuário comum pode trocar o próprio perfil; idealmente o backend deve impedir elevação de privilégio.
5. Endpoints de pedidos e itens não têm restrição `Admin` e não deixam clara a checagem de propriedade do pedido. A segurança precisa ser garantida no backend, não na UI.
6. O contrato de enum pode chegar como caractere (`A`, `I`, `D`, `P`, `O`) ou, dependendo das opções globais de JSON, como valor numérico. Confirmar no Swagger/resposta real antes de fechar os enums TypeScript.
7. O endpoint SSE não declara a política `SSEPolicy` no controller e pode conflitar com a exigência do header `app-origin` no `EventSource` nativo.
8. O arquivo `appsettings.json` contém configurações sensíveis. Segredos devem ser retirados do repositório, rotacionados e fornecidos por variáveis de ambiente.

## 13. Critérios de pronto do MVP

- Usuário entra, atualiza a página e permanece autenticado sem acesso ao cookie.
- Guards bloqueiam rotas e ações administrativas.
- Admin gerencia categorias, produtos, usuários e perfis.
- Usuário autenticado cria pedido, inclui/remove itens e altera status apenas nas transições válidas.
- Listas paginadas enviam os filtros no formato esperado pela API.
- Imagens são enviadas e exibidas corretamente.
- Erros `400/401/403/404/500` têm comportamento consistente.
- Layout funciona em celular e desktop.
- Fluxos de ativação e recuperação de senha aceitam token pela query string e não o persistem.
- Testes cobrem autenticação, guards, interceptor, filtros e formulários críticos.
