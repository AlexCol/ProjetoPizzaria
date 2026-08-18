# Migrar a DataTable de usuários para o modo servidor

Este documento descreve como alterar a página de usuários para que filtros,
ordenação e paginação sejam executados pela API, em vez de processar localmente
a lista completa de usuários.

## Estado atual

A página carrega todos os usuários com:

```ts
this.usersService.getAllUsers();
```

E entrega a lista completa para a DataTable, que opera no modo local:

```html
<app-data-table
  [data]="users()"
  [columns]="tableColumns()"
  [loading]="loading()"
/>
```

O projeto já possui a infraestrutura necessária para o modo servidor:

- `DataTableComponent` aceita `mode="server"`.
- A tabela emite `queryChange` ao paginar, ordenar ou filtrar.
- `UsersService.getUsers()` consulta `GET /users/search`.
- A API devolve `PaginatedData<User>` com `data`, `total`, `page` e `limit`.

O fluxo final será:

```text
Usuário interage com a tabela
        ↓
DataTable emite DataTableQuery
        ↓
UsuariosComponent repassa a consulta
        ↓
UsuariosDataService chama UsersService.getUsers()
        ↓
GET /users/search
        ↓
API devolve a página atual e o total
        ↓
Signals users e total atualizam a tabela
```

## 1. Importar os tipos da consulta

Em `usuarios-data.service.ts`, importar `DataTableQuery` e os tipos aceitos pelo
serviço de usuários:

```ts
import { DataTableQuery } from '../../../../components/shared/data-table/data-table.interfaces';
import {
  SortOrder,
  UserSortField,
} from '../../../../services/domain/users/user.interfaces';
```

## 2. Armazenar o total e a consulta atual

Adicionar ao `UsuariosDataService`:

```ts
readonly total = signal(0);

private currentQuery: DataTableQuery = {
  page: 1,
  limit: 10,
  sortField: 'Name',
  sortOrder: 'asc',
  filters: [],
};
```

`total` representa a quantidade total de registros encontrada pela API, não
apenas a quantidade recebida na página atual. A TanStack Table utiliza esse
valor para calcular a quantidade de páginas.

`currentQuery` preserva a paginação, a ordenação e os filtros atuais. Isso
permite recarregar a mesma consulta depois de criar, editar ou excluir um
usuário.

## 3. Receber consultas emitidas pela tabela

Adicionar um método público ao `UsuariosDataService`:

```ts
changeQuery(query: DataTableQuery): void {
  this.currentQuery = query;
  this.loadUsers();
}
```

Toda interação no modo servidor produzirá uma nova `DataTableQuery`:

```ts
interface DataTableQuery {
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters: Array<{
    field: string;
    value: string | number;
  }>;
}
```

## 4. Consultar o endpoint paginado

Substituir o conteúdo do `loadUsers()` em `usuarios-data.service.ts`:

```ts
private loadUsers(): void {
  const query = this.currentQuery;

  const nameFilter = query.filters.find(
    (filter) => filter.field === 'Name',
  );

  const roleFilter = query.filters.find(
    (filter) => filter.field === 'RoleId',
  );

  const sortField = (query.sortField ?? 'Name') as UserSortField;
  const sortOrder = (query.sortOrder ?? 'asc') as SortOrder;

  this.loading.set(true);

  this.usersService
    .getUsers(
      query.page,
      query.limit,
      nameFilter ? String(nameFilter.value) : '',
      roleFilter ? String(roleFilter.value) : undefined,
      sortField,
      sortOrder,
    )
    .pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.total.set(response.total);
      },
      error: (error: HttpErrorResponse) => {
        this.users.set([]);
        this.total.set(0);

        this.toast.error(
          getApiErrorMessage(
            error,
            'Não foi possível carregar os usuários.',
          ),
          'Erro',
        );
      },
    });
}
```

O carregamento inicial continua chamando o mesmo método:

```ts
load(): void {
  this.loadRoles();
  this.loadUsers();
}
```

Os fluxos de criação, edição e exclusão também podem continuar chamando
`loadUsers()`. Como o método usa `currentQuery`, a consulta atual será refeita.

## 5. Conectar a consulta ao componente da página

Em `usuarios.ts`, adicionar `DataTableQuery` ao import das interfaces:

```ts
import {
  DataTableCellTemplateContext,
  DataTableFilterOption,
  DataTableQuery,
} from '../../../../components/shared/data-table/data-table.interfaces';
```

Expor o total mantido pelo serviço:

```ts
readonly users = this.data.users;
readonly total = this.data.total;
readonly loading = this.data.loading;
```

Adicionar o manipulador do evento da tabela:

```ts
handleTableQuery(query: DataTableQuery): void {
  this.data.changeQuery(query);
}
```

## 6. Ativar o modo servidor no HTML

Em `usuarios.html`, alterar a DataTable:

```html
<app-data-table
  mode="server"
  [data]="users()"
  [columns]="tableColumns()"
  [total]="total()"
  [loading]="loading()"
  [pageSizeOptions]="[10, 25, 50]"
  emptyMessage="Nenhum usuário encontrado."
  (queryChange)="handleTableQuery($event)"
/>
```

As três ligações essenciais para o modo servidor são:

```html
mode="server"
[total]="total()"
(queryChange)="handleTableQuery($event)"
```

## 7. Sincronizar a ordenação inicial

Em `usuarios-table.columns.ts`, definir a ordenação inicial da coluna Nome:

```ts
createDataTableColumn<User>({
  field: 'name',
  header: 'Nome',
  sortField: 'Name',
  initialSort: 'asc',
  filter: {
    field: 'Name',
    placeholder: 'Buscar por nome...',
  },
}),
```

Essa configuração mantém a interface sincronizada com a consulta inicial:

```ts
{
  sortField: 'Name',
  sortOrder: 'asc',
}
```

## 8. Correspondência entre colunas e API

Os identificadores enviados ao backend são definidos por `sortField` e
`filter.field` nas configurações das colunas:

| Coluna | Ordenação enviada | Filtro enviado |
| --- | --- | --- |
| Nome | `Name` | `Name` |
| E-mail | `Email` | — |
| Perfil | `RoleId` | `RoleId` |
| Status | `Status` | — |
| Controles | desabilitada | — |

O método `UsersService.getUsers()` transforma a consulta em parâmetros HTTP. Um
exemplo de requisição é:

```http
GET /users/search?page=1&limit=10&sort-field=Name&sort-order=asc&name=alex&roleId=2
```

A API retorna:

```ts
interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

Somente `response.data` deve ser atribuído ao signal `users`. O valor
`response.total` deve ser atribuído separadamente ao signal `total`.

## 9. Atenção à ordenação por perfil

No modo local, a coluna Perfil usa este accessor:

```ts
accessor: (user) => user.role.name;
```

Assim, a ordenação local considera o nome do perfil. No modo servidor, a coluna
envia:

```ts
sortField: 'RoleId';
```

Portanto, a API ordenará pelo identificador do perfil, e não necessariamente
pelo nome exibido. Para ordenar pelo nome, seria necessário implementar no
backend uma ordenação pela relação `Role.Name`.

## 10. Concorrência entre requisições

O filtro textual já possui debounce dentro da DataTable. Mesmo assim, ações
rápidas podem criar mais de uma requisição simultânea. Uma resposta antiga pode
chegar depois da resposta mais recente e sobrescrever a tabela.

Se isso ocorrer, o próximo aprimoramento deve ser centralizar as consultas em um
`Subject<DataTableQuery>` e usar `switchMap`, que cancela a inscrição da consulta
anterior quando uma nova consulta é emitida.

Essa melhoria não é obrigatória para ativar o modo servidor, mas torna o fluxo
mais robusto.

## Checklist de validação

- A página chama `/users/search` ao abrir.
- A página não usa mais `getAllUsers()` para preencher a DataTable.
- A resposta contém apenas os usuários da página atual.
- O signal `total` recebe o total geral retornado pela API.
- Trocar de página altera o parâmetro `page`.
- Trocar a quantidade de linhas altera o parâmetro `limit`.
- Ordenar altera `sort-field` e `sort-order`.
- Pesquisar por nome envia `name`.
- Selecionar um perfil envia `roleId`.
- Criar, editar ou excluir recarrega a consulta atual.
- Erros limpam `users` e `total` e exibem uma mensagem.
- O indicador de carregamento permanece visível durante a consulta.
