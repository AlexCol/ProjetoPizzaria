# Novo DataTable com TanStack - Guia de Implementacao (Simples e Manutenivel)

## Objetivo
Construir um novo `DataTable` com `@tanstack/react-table`, mantendo consumo simples na tela e suporte a:
- Busca
- Ordenacao
- Paginacao

Modos:
- `client`: dados em memoria
- `server`: backend controla query

---

## Dependencias
Obrigatoria:

```bash
npm i @tanstack/react-table
```

Recomendada para dados server-side:

```bash
npm i @tanstack/react-query
```

Opcional (icones):

```bash
npm i lucide-react
```

---

## Principios
1. Uma API unica (`<DataTable ... />`).
2. Mesmo componente para `client` e `server`.
3. Sem hacks de renderizacao.
4. Estado/regra no hook, UI em componentes pequenos.
5. Base extensivel (ex.: selecao de linha) sem poluir o MVP.

---

## Estrutura sugerida (sem redundancia)
Crie em `src/components/singles/DataTable`:

```txt
DataTable/
  index.tsx
  table.tsx
  toolbar.tsx
  pagination.tsx
  useDataTableState.ts
  types.ts
```

Se o time preferir, pode separar por pasta `components/`, mas evitando nomes repetidos como `DataTableTable.tsx`.

---

## 1. Tipos base (`types.ts`)
Use `ColumnDef<TData, TValue>` do TanStack.

```ts
import { ColumnDef } from '@tanstack/react-table';

export type SortDirection = 'asc' | 'desc';

export type DataTableQueryState = {
  page: number;
  pageSize: number;
  search: string;
  sortField?: string;
  sortDirection?: SortDirection;
};

type BaseProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  loading?: boolean;
  emptyMessage?: string;
  showPagination?: boolean;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
};

export type ClientProps<TData> = BaseProps<TData> & {
  mode?: 'client';
  initialPageSize?: number;
};

export type ServerProps<TData> = BaseProps<TData> & {
  mode: 'server';
  totalItems: number;
  query: DataTableQueryState;
  onQueryChange: (query: DataTableQueryState) => void;
};

export type DataTableProps<TData> = ClientProps<TData> | ServerProps<TData>;
```

### Dica importante sobre union type
Mantenha a union para seguranca da API publica, mas evite `narrowing` em todo o hook com um normalizador:

```ts
function normalizeProps<TData>(props: DataTableProps<TData>) {
  const mode = props.mode ?? 'client';

  if (mode === 'server') {
    return {
      mode,
      totalItems: props.totalItems,
      query: props.query,
      onQueryChange: props.onQueryChange,
      initialPageSize: props.query.pageSize,
      ...props,
    };
  }

  return {
    mode,
    totalItems: props.data.length,
    query: {
      page: 1,
      pageSize: props.initialPageSize ?? 20,
      search: '',
      sortField: undefined,
      sortDirection: undefined,
    },
    onQueryChange: undefined,
    ...props,
  };
}
```

---

## 2. Hook unico (`useDataTableState.ts`)
No hook, inicialize `useReactTable` e concentre regra de client/server.

TanStack recomendado:
- `getCoreRowModel`
- `getFilteredRowModel`
- `getSortedRowModel`
- `getPaginationRowModel`

Regras:
1. `client`
- `sorting`, `globalFilter` e `pagination` locais.
- TanStack processa em memoria.

2. `server`
- `manualSorting: true`
- `manualFiltering: true`
- `manualPagination: true`
- `pageCount: Math.ceil(totalItems / query.pageSize)`
- Toda mudanca chama `onQueryChange`.

3. Sempre resetar para pagina 1 quando mudar busca, ordenacao ou `pageSize`.

---

## 3. Componentes visuais (burros)
- `toolbar.tsx`: busca global + total
- `table.tsx`: header/body + clique de ordenacao
- `pagination.tsx`: page size + navegacao
- `index.tsx`: orquestra tudo

Sem regra de negocio pesada no JSX.

---

## 4. Casos de borda que devem estar no guia

### Coluna sem `accessorKey`
Para colunas de acao/calculo, use `id` + `accessorFn` (quando precisar valor):

```ts
{
  id: 'statusLabel',
  header: 'Status',
  accessorFn: (row) => (row.ativo ? 'Ativo' : 'Inativo'),
}
```

### Celula customizada
Muito comum em producao:

```ts
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ getValue }) => <Badge value={String(getValue())} />,
}
```

### Coluna de acoes
Sem busca e sem ordenacao:

```ts
{
  id: 'acoes',
  header: 'Acoes',
  enableSorting: false,
  enableColumnFilter: false,
  cell: ({ row }) => <AcoesMenu row={row.original} />,
}
```

### Valores nulos/undefined
Defina fallback no `cell`:

```ts
cell: ({ getValue }) => getValue() ?? '-'
```

---

## 5. Exemplo de uso (client)

```tsx
import { ColumnDef } from '@tanstack/react-table';

type Usuario = { id: string; nome: string; email: string; status?: string | null };

const columns: ColumnDef<Usuario>[] = [
  { accessorKey: 'nome', header: 'Nome' },
  { accessorKey: 'email', header: 'E-mail' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => getValue() ?? '-' },
];

<DataTable
  mode='client'
  data={usuarios}
  columns={columns}
  initialPageSize={20}
  pageSizeOptions={[10, 20, 50]}
  emptyMessage='Nenhum usuario encontrado'
/>
```

---

## 6. Exemplo de uso (server) com React Query (recomendado)

```tsx
import { useQuery } from '@tanstack/react-query';

const [queryState, setQueryState] = useState<DataTableQueryState>({
  page: 1,
  pageSize: 20,
  search: '',
  sortField: undefined,
  sortDirection: undefined,
});

const { data, isFetching } = useQuery({
  queryKey: ['usuarios', queryState],
  queryFn: () => api.listarUsuarios(queryState),
});

<DataTable
  mode='server'
  data={data?.data ?? []}
  columns={columns}
  totalItems={data?.totalItems ?? 0}
  query={queryState}
  onQueryChange={setQueryState}
  loading={isFetching}
  emptyMessage='Nenhum registro encontrado'
/>
```

Observacao: `useEffect` pode funcionar, mas React Query/SWR e o caminho esperado hoje para cache, refetch e estado de carregamento.

---

## 7. Extensibilidade: selecao de linhas
Mesmo fora do MVP, deixe previsto no contrato:
- `enableRowSelection?: boolean`
- `selectedRowIds?: Record<string, boolean>`
- `onSelectedRowIdsChange?: (state) => void`

No TanStack:
- usar `rowSelection` no `state`
- habilitar `onRowSelectionChange`
- adicionar coluna de checkbox apenas quando `enableRowSelection = true`

---

## 8. Mapeamento recomendado para backend
Request:

```ts
{
  page: number,
  pageSize: number,
  search: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
}
```

Response:

```ts
{
  data: T[],
  totalItems: number
}
```

---

## 9. Checklist de qualidade
1. Nao usar `useReactTable({} as any)` em subcomponentes.
2. Nao duplicar estado sem necessidade.
3. Resetar pagina ao mudar busca/ordenacao/pageSize.
4. Em `server`, nao aplicar processamentos client-side por engano.
5. Cobrir colunas sem `accessorKey`, celulas customizadas e nulos.
6. Validar em pelo menos 2 telas reais.

---

## 10. DoD (Definicao de pronto)
Pronto quando:
1. Busca, ordenacao e paginacao funcionam em `client`.
2. Busca, ordenacao e paginacao funcionam em `server`.
3. API de consumo continua curta.
4. Casos de borda principais estao documentados.
5. Caminho de extensao para selecao de linhas esta definido.

---

## 11. Implementacao incremental
1. Criar `types.ts` + `normalizeProps`.
2. Entregar modo `client` completo.
3. Adicionar modo `server` controlado.
4. Integrar com React Query em 1 tela real.
5. Validar casos de borda e ajustar UI.
