# Migrar uma DataTable do modo servidor para o modo local

Este guia descreve como migrar qualquer tela que usa `DataTableComponent` do
modo `server` para o modo `local`.

Guia inverso: [migrar do modo local para o modo servidor](./MIGRAR-DATATABLE-PARA-SERVER.md).

No modo servidor, a API filtra, ordena e pagina os registros. No modo local, o
frontend carrega a coleção completa e a TanStack Table realiza essas operações
no navegador.

Use nomes como `Registro`, `registros` e `RecursoService` apenas como
placeholders. Substitua-os pelos tipos e serviços reais da tela.

## Quando usar o modo local

O modo local é adequado quando:

- a quantidade total de registros é pequena ou possui um limite previsível;
- o endpoint pode devolver a coleção completa com segurança;
- filtros e ordenação não precisam reproduzir regras específicas do banco;
- a simplicidade do frontend é mais importante que paginação real na API.

Mantenha o modo servidor quando o volume puder crescer muito. No modo local,
alterar o tamanho da página não reduz o tráfego: todos os registros já foram
transferidos para o navegador.

## Fluxo do modo local

```text
Página é aberta
  -> data service chama o endpoint de listagem completa
  -> API devolve T[]
  -> signal atualiza a DataTable
  -> TanStack filtra, ordena e pagina no navegador
```

Depois da carga inicial, paginação, ordenação e filtros não fazem novas chamadas
HTTP.

## Pré-requisito: endpoint de listagem completa

Confirme que o recurso possui um endpoint que retorna a coleção completa:

```ts
T[]
```

Não use o modelo paginado como fonte da tabela local. A propriedade `data` de
uma única resposta paginada contém somente uma página, não a coleção completa.

### Situação atual dos recursos usados como exemplo

| Recurso    | Endpoint completo     | Serviço gerado       |
| ---------- | --------------------- | -------------------- |
| Usuários   | `GET /api/Users`      | `getApiUsers()`      |
| Categorias | `GET /api/Categories` | `getApiCategories()` |

## 1. Simplificar o estado do data service

Remova o estado exclusivo do modo servidor:

```ts
readonly total = signal(0);
private currentQuery: DataTableQuery = { ... };
```

Remova também:

- o import de `DataTableQuery`;
- o tipo auxiliar de query params dinâmicos;
- a função `toSearchParams()`;
- o método `changeQuery()`;
- qualquer `Subject<DataTableQuery>` criado apenas para consultas da tabela.

Mantenha os signals usados nos dois modos:

```ts
readonly registros = signal<Registro[]>([]);
readonly loading = signal(false);
```

Signals de operações CRUD, como `saving` e `deleting`, também permanecem.

## 2. Trocar a consulta paginada pela listagem completa

Substitua o método `/search` pelo método gerado que retorna a coleção inteira.

Antes, no modo servidor:

```ts
this.recursoService.getApiRecursoSearch(params);
```

Depois, no modo local:

```ts
private loadRegistros(): void {
  this.loading.set(true);
  this.recursoService
    .getApiRecursos()
    .pipe(
      map((response) => response.map(this.toRegistro)),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (registros) => this.registros.set(registros),
      error: (error: HttpErrorResponse) => {
        this.registros.set([]);
        this.toast.error(
          getApiErrorMessage(error, 'Não foi possível carregar os registros.'),
          'Erro',
        );
      },
    });
}
```

`getApiRecursos()` e `toRegistro` são placeholders. Use o método e o adaptador
reais da tela.

Se o endpoint já retorna exatamente o tipo usado pela tabela, remova o `map`:

```ts
this.recursoService.getApiRecursos().pipe(
  finalize(() => this.loading.set(false)),
  takeUntilDestroyed(this.destroyRef),
);
```

Exemplos reais do projeto:

```ts
this.usersService.getApiUsers();
this.categoriesService.getApiCategories();
```

## 3. Manter o carregamento inicial e o CRUD

O carregamento inicial continua explícito:

```ts
load(): void {
  this.loadRegistros();
}
```

Depois de criar, editar ou excluir, chame `loadRegistros()` novamente. A API
devolverá a coleção atualizada e a DataTable reaplicará seu estado local.

Se quiser voltar sempre para a primeira página após uma mutação, será necessário
expor esse comportamento no componente compartilhado ou recriar a tabela. A
implementação atual preserva o estado interno enquanto o componente existir.

## 4. Simplificar o componente da página

Remova a exposição do total:

```ts
readonly total = this.data.total;
```

Remova o manipulador de consultas:

```ts
handleTableQuery(query: DataTableQuery): void {
  this.data.changeQuery(query);
}
```

E remova o import de `DataTableQuery` se ele não for usado em outro lugar.

O componente precisa expor somente os dados e estados visuais relevantes:

```ts
readonly registros = this.data.registros;
readonly loading = this.data.loading;
```

## 5. Ativar o modo local no HTML

Antes:

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

Depois:

```html
<app-data-table
  [data]="registros()"
  [columns]="tableColumns()"
  [loading]="loading()"
  emptyMessage="Nenhum registro encontrado."
/>
```

`local` é o modo padrão. Portanto, tanto faz omitir o input ou declará-lo:

```html
mode="local"
```

Remova obrigatoriamente os elementos exclusivos do fluxo servidor:

```html
mode="server" [total]="total()" (queryChange)="handleTableQuery($event)"
```

`pageSizeOptions` pode permanecer. No modo local, ele controla apenas quantos
registros já carregados aparecem em cada página.

## 6. Revisar as colunas

No modo servidor:

- `sortField` define o campo enviado à API;
- `filter.field` define o parâmetro enviado à API.

No modo local, essas duas propriedades não controlam o valor comparado. A tabela
usa `field` ou o resultado de `accessor`.

As propriedades `sortField` e `filter.field` podem ser removidas para deixar a
configuração mais clara, embora não prejudiquem o modo local.

### Campo direto

```ts
createDataTableColumn<Registro>({
  field: 'name',
  header: 'Nome',
  initialSort: 'asc',
  filter: {
    placeholder: 'Buscar por nome...',
  },
});
```

O filtro e a ordenação usam `registro.name`.

### Campo calculado ou aninhado

```ts
createDataTableColumn<Registro>({
  id: 'grupo',
  header: 'Grupo',
  accessor: (registro) => registro.group.name,
  sortable: true,
  filter: {
    type: 'select',
    placeholder: 'Todos os grupos',
    options: groupOptions,
  },
});
```

Neste exemplo, ordenação e filtro usam o nome retornado pelo accessor.

## 7. Ajustar filtros do tipo `select`

No modo servidor, o valor de uma opção costuma ser o identificador esperado
pela API:

```ts
{ label: 'Administrador', value: role.id }
```

No modo local, o valor precisa corresponder exatamente ao valor retornado por
`field` ou `accessor`. Se o accessor retorna `registro.role.name`, use:

```ts
{ label: 'Administrador', value: role.name }
```

Caso contrário, a opção será exibida, mas não encontrará nenhuma linha.

Filtros textuais usam comparação parcial sem diferenciar maiúsculas e
minúsculas. Filtros `select` usam igualdade textual.

## 8. Revisar a ordenação inicial

`initialSort` funciona nos dois modos:

```ts
initialSort: 'asc';
```

No modo local, não existe uma consulta inicial no data service para sincronizar.
A própria DataTable aplica a ordenação depois de receber as colunas e os dados.

Use `initialSort` em somente uma coluna.

## 9. Remover tratamento específico da resposta paginada

O modo local não utiliza:

```ts
response.data;
response.total;
response.page;
response.limit;
```

O retorno esperado é o próprio array:

```ts
next: (registros) => this.registros.set(registros);
```

Também não é necessário normalizar `total` com `Number(...)`.

## 10. Concorrência e cancelamento

Depois da carga inicial, filtros, ordenação e paginação não criam requisições.
Logo, o `Subject<DataTableQuery>` e o `switchMap` usados exclusivamente para
consultas da tabela podem ser removidos.

Mantenha `takeUntilDestroyed(this.destroyRef)` nas requisições de carregamento e
CRUD para encerrar inscrições quando a tela for destruída.

## Exemplos do projeto

### Usuários

Para usuários em modo local:

- carregue com `getApiUsers()`;
- transforme `ResponseUserDto[]` em `User[]` com o adaptador existente;
- use nomes de perfil como valores do filtro local;
- remova `total`, `DataTableQuery` e `getApiUsersSearch()`.

### Categorias

A tela de categorias já usa o modo local:

- carrega com `getApiCategories()`;
- entrega `Category[]` diretamente à tabela;
- filtra e ordena pelo campo `name`;
- não precisa de `total` nem de `(queryChange)`.

Ela pode ser usada como referência simples para o fluxo local.

## Checklist por tela

- O endpoint escolhido retorna a coleção completa, e não somente uma página.
- O volume total é adequado para processamento no navegador.
- O data service não mantém `total` nem `currentQuery` sem necessidade.
- O carregamento usa o método de listagem completa gerado pelo Orval.
- O componente não possui `handleTableQuery()` sem necessidade.
- O HTML não define `mode="server"`, `[total]` ou `(queryChange)`.
- Filtros `select` usam valores iguais ao `field` ou `accessor` local.
- Campos com `accessor` definem `sortable: true` quando necessário.
- Somente uma coluna possui `initialSort`.
- Criar, editar e excluir recarregam a coleção completa.
- Erros limpam o array e encerram corretamente o estado de carregamento.
