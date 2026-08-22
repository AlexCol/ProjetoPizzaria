# Migrar uma DataTable do modo local para o modo servidor

Este guia descreve como migrar qualquer tela que usa `DataTableComponent` do
modo `local` para o modo `server`. Os exemplos usam nomes genéricos como
`Registro`, `registros` e `RecursoService`; substitua-os pelo domínio da tela.

Guia inverso: [migrar do modo servidor para o modo local](./MIGRAR-DATATABLE-PARA-LOCAL.md).

No modo local, o frontend recebe a coleção inteira e a TanStack Table filtra,
ordena e pagina no navegador. No modo servidor, a API recebe a consulta e
devolve somente a página atual, junto com o total de registros encontrados.

## Validação do guia anterior

O guia antigo não correspondia mais ao código atual. Estas referências foram
removidas porque não existem no projeto:

| Referência antiga                       | Situação atual                                                         |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `UsersService.getAllUsers()`            | O método gerado atual é `getApiUsers()`                                |
| `UsersService.getUsers()`               | O método paginado atual é `getApiUsersSearch()`                        |
| `SortOrder` e `UserSortField`           | Esses tipos não existem mais                                           |
| `services/domain/users/user.interfaces` | Esse diretório não existe mais                                         |
| `PaginatedData<User>`                   | O Orval gera um tipo concreto, como `PaginatedResultOfResponseUserDto` |
| Parâmetros posicionais no serviço       | Os serviços gerados recebem um objeto de query params                  |

Os tipos compartilhados que realmente existem e devem ser usados são:

- `DataTableQuery`
- `DataTableFilter`
- `DataTableFilterValue`
- `DataTableColumn<TData>`

Eles ficam em:

```text
components/shared/data-table/data-table.interfaces.ts
```

## Pré-requisito: a API precisa ter busca paginada

Antes de alterar uma tela, confirme que seu recurso possui um endpoint de busca
que aceita:

```text
page
limit
sort-field
sort-order
qualquer filtro configurado nas colunas
```

E retorna um objeto neste formato lógico:

```ts
{
  data: T[];
  total: number | string;
  page: number | string;
  limit: number | string;
}
```

Não crie manualmente um import de `PaginatedData<T>`, pois esse tipo não existe
no frontend atual. Use o tipo concreto gerado pelo Orval para o endpoint, por
exemplo:

```ts
PaginatedResultOfResponseUserDto;
```

Os campos `total`, `page` e `limit` dos modelos gerados podem ser opcionais e do
tipo `number | string`. Normalize `total` antes de entregá-lo à tabela:

```ts
this.total.set(Number(response.total ?? 0));
```

### Situação atual dos recursos

| Recurso    | Endpoint paginado          | Serviço gerado           |
| ---------- | -------------------------- | ------------------------ |
| Usuários   | `GET /api/Users/search`    | `getApiUsersSearch()`    |
| Produtos   | `GET /api/Products/search` | `getApiProductsSearch()` |
| Perfis     | `GET /api/Roles/search`    | `getApiRolesSearch()`    |
| Categorias | ainda não existe           | ainda não existe         |

Portanto, a tela de categorias ainda não pode operar corretamente em modo
servidor. Primeiro é necessário criar o endpoint paginado no backend e executar
novamente o Orval. Há um roteiro específico para categorias no final deste
documento.

## Fluxo do modo servidor

```text
Interação na tabela
  -> DataTable emite DataTableQuery
  -> componente da página encaminha a consulta
  -> data service converte a consulta em query params
  -> serviço gerado chama o endpoint /search
  -> API devolve data e total
  -> signals atualizam a tabela
```

## 1. Configurar as colunas para o contrato da API

`sortField` e `filter.field` são nomes enviados ao backend. Eles não precisam
ser iguais ao campo usado para exibir a célula.

```ts
createDataTableColumn<Registro>({
  field: 'name',
  header: 'Nome',
  sortField: 'Name',
  initialSort: 'asc',
  filter: {
    field: 'Name',
    placeholder: 'Buscar por nome...',
  },
});
```

Para uma propriedade aninhada ou calculada:

```ts
createDataTableColumn<Registro>({
  id: 'grupo',
  header: 'Grupo',
  accessor: (registro) => registro.group.name,
  sortable: true,
  sortField: 'GroupId',
  filter: {
    type: 'select',
    field: 'GroupId',
    placeholder: 'Todos os grupos',
    options: groupOptions,
  },
});
```

No backend atual, os nomes são comparados com propriedades da entidade sem
diferenciar maiúsculas de minúsculas. Campos desconhecidos são ignorados. A
consulta dinâmica também não resolve caminhos aninhados como `Group.Name`.

Consequentemente, `sortField: 'GroupId'` ordena pelo identificador, não pelo nome
mostrado pelo accessor. Ordenar por um campo relacionado exige suporte adicional
no backend.

Use `initialSort` em somente uma coluna. A consulta inicial do data service deve
usar o mesmo campo e a mesma direção para manter a interface sincronizada.

## 2. Criar o estado da consulta no data service

Importe o tipo real da tabela:

```ts
import { DataTableQuery } from '../../../../components/shared/data-table/data-table.interfaces';
```

Adicione o total e preserve a última consulta:

```ts
readonly registros = signal<Registro[]>([]);
readonly total = signal(0);
readonly loading = signal(false);

private currentQuery: DataTableQuery = {
  page: 1,
  limit: 10,
  sortField: 'Name',
  sortOrder: 'asc',
  filters: [],
};
```

O `limit` inicial deve ser igual ao `pageSize` inicial da DataTable, atualmente
`10`. Se a coluna não possuir `initialSort`, omita `sortField` e `sortOrder`.

## 3. Converter `DataTableQuery` em query params

Os endpoints de busca aceitam filtros adicionais, mas o OpenAPI só descreve os
quatro parâmetros reservados. Por isso tipos gerados como
`GetApiUsersSearchParams` não listam `Name`, `RoleId` ou outros filtros
dinâmicos.

Use uma interseção com `Record` para manter os parâmetros reservados tipados e
permitir filtros configurados nas colunas:

O exemplo abaixo usa `GetApiUsersSearchParams`, que existe hoje, apenas como
tipo conhecido pelo Orval. Ao migrar outro recurso, troque-o pelo tipo de
parâmetros gerado para aquele endpoint.

```ts
import type { GetApiUsersSearchParams } from '../../../../api/generated/models';

type DynamicSearchParams<TParams extends object> = TParams & Record<string, string | number>;
type RecursoSearchParams = DynamicSearchParams<GetApiUsersSearchParams>;

function toSearchParams(query: DataTableQuery): RecursoSearchParams {
  const params: RecursoSearchParams = {
    page: query.page,
    limit: query.limit,
  };

  if (query.sortField) {
    params['sort-field'] = query.sortField;
  }

  if (query.sortOrder) {
    params['sort-order'] = query.sortOrder;
  }

  for (const filter of query.filters) {
    params[filter.field] = filter.value;
  }

  return params;
}
```

Para categorias, depois de criar o endpoint e regenerar a API, substitua
`GetApiUsersSearchParams` por `GetApiCategoriesSearchParams`.

Não transforme os filtros em parâmetros específicos dentro da DataTable. A
tabela já usa `filter.field`, o que mantém o componente compartilhado genérico.

## 4. Carregar uma página

O método de carregamento deve:

1. converter `currentQuery` em parâmetros;
2. chamar o método `/search` gerado pelo Orval;
3. adaptar os DTOs para o modelo da tela, quando necessário;
4. atualizar separadamente `registros` e `total`;
5. limpar ambos em caso de erro.

Exemplo genérico:

```ts
private loadRegistros(): void {
  const params = toSearchParams(this.currentQuery);

  this.loading.set(true);
  this.recursoService
    .getApiRecursoSearch(params)
    .pipe(
      map((response) => ({
        rows: response.data.map(this.toRegistro),
        total: Number(response.total ?? 0),
      })),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: ({ rows, total }) => {
        this.registros.set(rows);
        this.total.set(total);
      },
      error: (error: HttpErrorResponse) => {
        this.registros.set([]);
        this.total.set(0);
        this.toast.error(
          getApiErrorMessage(error, 'Não foi possível carregar os registros.'),
          'Erro',
        );
      },
    });
}
```

Se a API já retorna exatamente o tipo usado pela tabela, não é necessário
mapear cada item:

```ts
rows: response.data,
```

`getApiRecursoSearch()` e `toRegistro` também são placeholders e devem ser
substituídos pelos nomes reais.

## 5. Receber novas consultas

No data service:

```ts
changeQuery(query: DataTableQuery): void {
  this.currentQuery = query;
  this.loadRegistros();
}
```

O carregamento inicial continua explícito:

```ts
load(): void {
  this.loadRegistros();
}
```

Após criar, editar ou excluir, chame `loadRegistros()` novamente. Como o método
usa `currentQuery`, a página, ordenação e filtros atuais são preservados.

## 6. Conectar o componente da página

No componente da tela:

```ts
import { DataTableQuery } from '../../../../components/shared/data-table/data-table.interfaces';

readonly registros = this.data.registros;
readonly total = this.data.total;
readonly loading = this.data.loading;

handleTableQuery(query: DataTableQuery): void {
  this.data.changeQuery(query);
}
```

## 7. Ativar o modo servidor no HTML

```html
<app-data-table
  mode="server"
  [data]="registros()"
  [columns]="tableColumns()"
  [total]="total()"
  [loading]="loading()"
  emptyMessage="Nenhum registro encontrado."
  (queryChange)="handleTableQuery($event)"
/>
```

As três ligações específicas do modo servidor são:

```html
mode="server" [total]="total()" (queryChange)="handleTableQuery($event)"
```

`queryChange` é emitido quando o usuário pagina, ordena ou filtra. Ele não faz a
consulta inicial; o data service precisa chamar `load()` ao abrir a tela.

Ao mudar filtro ou ordenação, a DataTable volta automaticamente para a primeira
página. O filtro textual possui debounce de 350 ms.

## 8. Evitar respostas fora de ordem

Debounce reduz chamadas durante a digitação, mas paginação e ordenação rápidas
ainda podem deixar requisições simultâneas. Uma resposta antiga pode chegar por
último e substituir dados mais recentes.

Para uma primeira migração manual, o fluxo direto acima funciona. Para telas com
muita interação, prefira um `Subject<DataTableQuery>` combinado com `switchMap`.
Assim, uma nova consulta cancela a inscrição da consulta anterior.

Independentemente da estratégia, mantenha `takeUntilDestroyed(this.destroyRef)`
para encerrar inscrições quando a tela for destruída.

## Migração futura da tela de categorias

Categorias possui hoje apenas `GET /api/Categories`, que retorna `Category[]`.
Antes de alterar o frontend, implemente no backend o equivalente aos endpoints
de busca de usuários, produtos e perfis:

1. Adicione ao `ICategoriesService` um método que receba
   `SearchCriteriaRequest<Category>` e retorne `PaginatedResult<Category>`.
2. Na implementação, use
   `_repository.GetWithSearchCriteriaAsync(searchCriteria)`.
3. Adicione ao controller `GET /api/Categories/search`, recebendo
   `[FromQuery] SearchCriteriaRequest<Category>`.
4. Declare `ProducesResponseType(typeof(PaginatedResult<Category>), 200)` para o
   OpenAPI gerar o contrato correto.
5. Execute `npm run orval` no projeto Angular.
6. Confirme a criação de equivalentes a:
   `getApiCategoriesSearch()`, `GetApiCategoriesSearchParams` e
   `PaginatedResultOfCategory`.

Depois disso, a configuração atual da coluna Nome já contém os mapeamentos
necessários:

```ts
createDataTableColumn<Category>({
  field: 'name',
  header: 'Nome',
  sortField: 'Name',
  initialSort: 'asc',
  filter: { field: 'Name', placeholder: 'Buscar por nome...' },
});
```

A consulta inicial recomendada para categorias é:

```ts
private currentQuery: DataTableQuery = {
  page: 1,
  limit: 10,
  sortField: 'Name',
  sortOrder: 'asc',
  filters: [],
};
```

O `initialSort: 'asc'` mantém o indicador visual sincronizado com a consulta
inicial.

## Checklist por tela

- O recurso possui um endpoint `/search` paginado.
- O Orval gerou o método, o tipo de parâmetros e o tipo da resposta paginada.
- A tela não usa mais o endpoint que retorna a coleção inteira.
- `initialSort` corresponde à consulta inicial do data service.
- Cada `sortField` é uma propriedade válida da entidade do backend.
- Cada `filter.field` é uma propriedade válida da entidade do backend.
- O data service preserva a última `DataTableQuery`.
- `total` é normalizado com `Number(response.total ?? 0)`.
- Erros limpam tanto os registros quanto o total.
- O HTML define `mode="server"`, `[total]` e `(queryChange)`.
- Paginar altera `page`.
- Trocar o tamanho da página altera `limit`.
- Ordenar altera `sort-field` e `sort-order`.
- Filtrar envia o nome definido em `filter.field`.
- Criar, editar e excluir recarregam a consulta atual.
- Respostas concorrentes não sobrescrevem uma consulta mais recente.
