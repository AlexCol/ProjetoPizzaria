# DataTable

Tabela genérica baseada em TanStack Table, com ordenação, filtros por coluna,
paginação, células customizadas e suporte a processamento local ou via API.

## Modos de uso

- `local`: recebe todos os registros e executa filtros, ordenação e paginação no navegador.
- `server`: recebe apenas a página atual. Toda mudança em filtros, ordenação ou paginação emite `queryChange` para que a página consulte a API.

## Importação

O componente é standalone e deve ser incluído nos imports da página:

```ts
import { Component } from '@angular/core';
import { DataTableComponent } from 'CAMINHO/components/shared/data-table/data-table';

@Component({
  selector: 'app-exemplo',
  templateUrl: './exemplo.html',
  imports: [DataTableComponent],
})
export class ExemploComponent {}
```

Ajuste `CAMINHO` de acordo com a localização da página.

## Configuração das colunas

Use `createDataTableColumn<T>()` para criar as colunas com inferência de tipos:

```ts
import { DataTableColumn } from 'CAMINHO/components/shared/data-table/data-table.interfaces';
import { createDataTableColumn } from 'CAMINHO/components/shared/data-table/create-data-table-column';

interface Product {
  id: string;
  name: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
}

readonly columns: DataTableColumn<Product>[] = [
  createDataTableColumn<Product>({
    field: 'name',
    header: 'Nome',
    initialSort: 'asc',
    filter: {
      placeholder: 'Buscar por nome...',
    },
  }),
  createDataTableColumn<Product>({
    field: 'price',
    header: 'Preço',
    formatter: (value) => Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    align: 'right',
  }),
  createDataTableColumn<Product>({
    id: 'category',
    header: 'Categoria',
    accessor: (product) => product.category.name,
    sortable: true,
  }),
];
```

### Propriedades de uma coluna

| Propriedade | Descrição |
| --- | --- |
| `id` | Identificador interno. Obrigatório quando não houver `field`. |
| `header` | Texto exibido no cabeçalho. |
| `field` | Propriedade direta do registro usada como valor da célula. |
| `accessor` | Função para propriedades calculadas ou aninhadas. |
| `formatter` | Formata o valor sem precisar criar um template. |
| `cellTemplate` | Template Angular para conteúdo complexo. |
| `cellClassName` | Classe fixa ou função que retorna uma classe por registro. |
| `sortable` | Habilita ou desabilita a ordenação. Colunas com `field` são ordenáveis por padrão. |
| `sortField` | Nome enviado à API ao ordenar. Pode ser diferente do `id`. |
| `initialSort` | Ordenação inicial da coluna: `asc` ou `desc`. Use em apenas uma coluna. |
| `filter` | Configuração do filtro de texto ou seleção. |
| `width` | Largura CSS, por exemplo `12rem` ou `160px`. |
| `align` | Alinhamento da célula: `left`, `center` ou `right`. |

Colunas criadas apenas com `id` ou `accessor` não são ordenáveis por padrão. Use
`sortable: true` quando quiser habilitar a ordenação.

## Uso local

No modo local, entregue ao componente a coleção completa. O TanStack processará
filtros, ordenação e paginação sem novas requisições.

```ts
import { signal } from '@angular/core';
import { DataTableFilterOption } from 'CAMINHO/components/shared/data-table/data-table.interfaces';

readonly products = signal<Product[]>([
  {
    id: '7282337203684016129',
    name: 'Pizza Margherita',
    price: 42,
    category: { id: '7282337000000000001', name: 'Pizzas' },
  },
]);

readonly categoryOptions: DataTableFilterOption[] = [
  { label: 'Pizzas', value: 'Pizzas' },
  { label: 'Bebidas', value: 'Bebidas' },
];
```

```ts
createDataTableColumn<Product>({
  id: 'category',
  header: 'Categoria',
  accessor: (product) => product.category.name,
  filter: {
    type: 'select',
    placeholder: 'Todas as categorias',
    options: this.categoryOptions,
  },
})
```

```html
<app-data-table
  [data]="products()"
  [columns]="columns"
  [pageSizeOptions]="[10, 25, 50]"
  emptyMessage="Nenhum produto encontrado."
/>
```

Para filtros locais do tipo `select`, o valor de cada opção deve corresponder ao
valor retornado por `field` ou `accessor`. No exemplo, o accessor retorna o nome
da categoria, por isso as opções também usam o nome.

## Uso com API

No modo `server`, a API é responsável por filtrar, ordenar e paginar. O componente
recebe a página retornada e o total de registros encontrados.

Resposta esperada da API:

```ts
export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

Configuração das colunas:

```ts
readonly roleOptions = signal<DataTableFilterOption[]>([]);

readonly columns = computed<DataTableColumn<User>[]>(() => [
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
  createDataTableColumn<User>({
    id: 'role',
    header: 'Perfil',
    accessor: (user) => user.role.name,
    sortable: true,
    sortField: 'RoleId',
    filter: {
      type: 'select',
      field: 'RoleId',
      placeholder: 'Todos os perfis',
      options: this.roleOptions(),
    },
  }),
]);
```

No modo servidor, o valor das opções pode ser o identificador esperado pela API:

```ts
this.roleOptions.set(
  roles.map((role) => ({
    label: role.name,
    value: role.id,
  })),
);
```

Estado e carregamento da página:

```ts
import { DataTableQuery } from 'CAMINHO/components/shared/data-table/data-table.interfaces';

private lastQuery: DataTableQuery = {
  page: 1,
  limit: 10,
  sortField: 'Name',
  sortOrder: 'asc',
  filters: [],
};

readonly users = signal<User[]>([]);
readonly total = signal(0);
readonly loading = signal(false);

constructor() {
  this.loadUsers();
}

handleTableQuery(query: DataTableQuery): void {
  this.lastQuery = query;
  this.loadUsers(query);
}

private loadUsers(query = this.lastQuery): void {
  const name = String(query.filters.find((filter) => filter.field === 'Name')?.value ?? '');
  const roleFilter = query.filters.find((filter) => filter.field === 'RoleId')?.value;
  const roleId = roleFilter === undefined || roleFilter === '' ? undefined : String(roleFilter);

  this.loading.set(true);
  this.usersService
    .getUsers(
      query.page,
      query.limit,
      name,
      roleId,
      query.sortField,
      query.sortOrder,
    )
    .subscribe({
      next: (result) => {
        this.users.set(result.data);
        this.total.set(result.total);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
}
```

Template:

```html
<app-data-table
  [data]="users()"
  [columns]="columns()"
  mode="server"
  [total]="total()"
  [loading]="loading()"
  [pageSizeOptions]="[10, 25, 50]"
  emptyMessage="Nenhum usuário encontrado."
  (queryChange)="handleTableQuery($event)"
/>
```

Uma interação pode emitir uma consulta como:

```ts
{
  page: 1,
  limit: 10,
  sortField: 'Name',
  sortOrder: 'asc',
  filters: [
    { field: 'Name', value: 'Maria' },
    { field: 'RoleId', value: '7282337000000000001' },
  ],
}
```

O componente volta para a primeira página quando um filtro ou a ordenação muda.
O filtro de texto possui debounce de 350 ms.

O `queryChange` é emitido após interações na tabela. A página deve executar a
primeira consulta no construtor ou no ciclo de inicialização usando os mesmos
valores declarados em `initialSort`.

## Células com template

Use `cellTemplate` quando a célula precisar de botões, badges ou outros componentes:

```ts
import { TemplateRef, computed, viewChild } from '@angular/core';
import {
  DataTableCellTemplateContext,
  DataTableColumn,
} from 'CAMINHO/components/shared/data-table/data-table.interfaces';

readonly statusTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<User>>>('statusTemplate');

readonly columns = computed<DataTableColumn<User>[]>(() => [
  createDataTableColumn<User>({
    field: 'status',
    header: 'Status',
    cellTemplate: this.statusTemplate(),
    width: '10rem',
  }),
]);
```

```html
<ng-template #statusTemplate let-user let-value="value">
  <span [class.active]="value === 'Active'">
    {{ user.name }}: {{ value }}
  </span>
</ng-template>
```

O contexto do template oferece:

- `$implicit`: registro completo, acessado por `let-user`.
- `row`: registro completo, acessado por `let-user="row"`.
- `value`: valor calculado da célula, acessado por `let-value="value"`.

## Inputs e output

| Nome | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `data` | `TData[]` | obrigatório | Registros da página ou coleção local. |
| `columns` | `DataTableColumn<TData>[]` | obrigatório | Definição das colunas. |
| `mode` | `local \| server` | `local` | Define onde os dados são processados. |
| `total` | `number` | `0` | Total retornado pela API no modo servidor. |
| `loading` | `boolean` | `false` | Exibe o estado de carregamento. |
| `emptyMessage` | `string` | mensagem padrão | Texto exibido quando não existem linhas. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Quantidades disponíveis por página. |
| `queryChange` | `DataTableQuery` | - | Evento emitido no modo servidor. |

## IDs long do C#

IDs `long` podem ultrapassar `Number.MAX_SAFE_INTEGER`. Eles devem ser
serializados pelo backend e mantidos no frontend como `string`:

```ts
interface Role {
  id: string;
  name: string;
}
```

Não use `Number(id)`, `parseInt(id)` ou operadores aritméticos nesses valores.
O Angular envia a string normalmente em query params, URLs e JSON, e o conversor
do backend pode transformá-la novamente em `long` sem perda de precisão.
