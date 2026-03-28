# Guia de Adicao do React Query

Este guia mostra como adicionar o React Query ao projeto atual sem precisar refatorar a estrutura toda da aplicacao.
O foco aqui e:

- instalar o React Query do zero
- registrar o `QueryClientProvider` no projeto
- adaptar o `useQuerable` para usar cache
- manter a API atual do hook o mais parecida possivel

Caminho base considerado neste guia:
- `projeto/web/vite_react_p2`

## 1. Instalar dependencias

Dentro de `projeto/web/vite_react_p2`, rode:

```bash
npm install @tanstack/react-query
```

Opcional para debug em desenvolvimento:

```bash
npm install @tanstack/react-query-devtools
```

## 2. Criar o QueryClient global

O React Query precisa de um `QueryClient` compartilhado pela aplicacao.

Sugestao de arquivo:
- `src/lib/react-query/queryClient.ts`

Exemplo:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Observacoes

- `staleTime: 30_000`
  - por 30 segundos os dados continuam frescos
  - se o usuario voltar para uma pagina ja carregada nesse intervalo, o cache pode ser reutilizado sem nova chamada

- `gcTime: 5 * 60_000`
  - mantem as queries em cache por 5 minutos apos deixarem de ser usadas

- `refetchOnWindowFocus: false`
  - evita refetch ao trocar de aba e voltar
  - para tabela administrativa costuma ser um comportamento mais confortavel

## 3. Registrar o provider no `main.tsx`

Arquivo atual:
- `src/main.tsx`

Envolver a aplicacao com `QueryClientProvider`.

Exemplo:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './components/contexts/auth/AuthContext.tsx';
import DarkMode from './components/contexts/darkMode/DarkMode.tsx';
import { SseProvider } from './components/contexts/sse/SSEContext.tsx';
import ToasterConfig from './components/singles/ToasterConfig/index.tsx';
import { queryClient } from './lib/react-query/queryClient';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToasterConfig />
      <SseProvider>
        <AuthProvider>
          <DarkMode>
            <App />
          </DarkMode>
        </AuthProvider>
      </SseProvider>
    </QueryClientProvider>
  </StrictMode>,
);
```

### Opcional: devtools

Se instalar `@tanstack/react-query-devtools`, pode colocar assim:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

E dentro do provider:

```tsx
<ReactQueryDevtools initialIsOpen={false} />
```

## 4. Objetivo da adaptacao no `useQuerable`

Hoje o `useQuerable`:

- guarda estados de filtro, ordenacao e paginacao
- monta `queryParams`
- chama `searcher` via `useEffect`
- controla `dados` e `isLoading` manualmente

Com React Query, a ideia e:

- continuar guardando filtros, ordenacao e paginacao no hook
- gerar uma `queryKey` com base nesses estados
- deixar o `useQuery` chamar o `searcher`
- manter o retorno do hook parecido com o atual

Assim, o restante do projeto quase nao muda.

## 5. Estrategia da `queryKey`

A chave precisa representar o estado da tabela.

Exemplo:

```ts
['querable', queryName, { page, limit, orderField, orderDirection, filters }]
```

Cada combinacao diferente gera uma entrada de cache diferente.

Exemplos:

- pagina 1 e pagina 2 tem caches separados
- ordenacao asc e desc tem caches separados
- filtros diferentes tem caches separados

Beneficio:
- se o usuario visitar a pagina 1, depois a 2, e voltar para a 1, o React Query pode reutilizar o cache da pagina 1

## 6. Exemplo de `useQuerable` com React Query

Abaixo esta uma versao pensada para manter a API atual o mais proxima possivel.

```tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DataTableServerSideManager } from '../interfaces/DataTableProps';
import type { PaginatedDtoResponse } from '@/services/util/paginatedDtoResponse';
import type { QueryParams } from '@/services/util/QueryParams';
import Logger from '@/utils/Logger';

type Querable<T> = {
  searcher: (params?: QueryParams) => Promise<PaginatedDtoResponse<T>>;
  queryName?: string;
};

export default function useQuerable<T>(querable: Querable<T>) {
  const [filters, setFilters] = useState<{ field: string; value: any }[]>([]);
  const [orderField, setOrderField] = useState<string>('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const queryParams = useMemo(() => {
    const params = {} as QueryParams;

    if (orderField) {
      params['sort-field'] = orderField;
      params['sort-order'] = orderDirection;
    }

    if (page) params.page = page;
    if (limit) params.limit = limit;

    if (filters.length > 0) {
      filters.forEach((filter) => {
        params[filter.field] = filter.value;
      });
    }

    return params;
  }, [filters, orderField, orderDirection, page, limit]);

  const query = useQuery({
    queryKey: ['querable', querable.queryName ?? 'default', queryParams],
    queryFn: async () => {
      try {
        return await querable.searcher(queryParams);
      } catch (error) {
        toast.error(`Erro ao carregar dados. ${error}`);
        Logger.error('useQuerable - queryFn', error);
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });

  async function loadData(_setLoading: boolean = true) {
    const result = await query.refetch();

    if (result.error) {
      throw result.error;
    }

    return result.data;
  }

  const totalItems = query.data?.total ?? 0;

  const datatableServerSideManager: DataTableServerSideManager = {
    where: {
      filters,
      onFiltersChange: setFilters,
    },
    ordernation: {
      sortField: orderField,
      sortDirection: orderDirection,
      onSortChange: (field: string, direction: 'asc' | 'desc') => {
        setOrderField(field);
        setOrderDirection(direction);
      },
    },
    pagination: {
      totalItems,
      currentPage: page,
      pageSize: limit,
      pageSizeOptions: [10, 20, 30, 50],
      onPageChange: setPage,
      onPageSizeChange: setLimit,
    },
  };

  return {
    dados: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    loadData,
    datatableServerSideManager,
  };
}
```

## 7. O que muda no comportamento da tabela

### Antes

- toda mudanca de pagina, filtro ou ordenacao chama o servidor manualmente
- o hook controla cache zero por conta propria

### Depois

- a mudanca de pagina, filtro ou ordenacao muda a `queryKey`
- o React Query armazena cada resultado por chave
- se uma chave ja existir no cache, ela pode ser reutilizada

Exemplo:

1. usuario abre pagina 1
2. vai para pagina 2
3. volta para pagina 1

Com a configuracao acima:
- a pagina 1 pode ser exibida a partir do cache
- dependendo do `staleTime`, pode nem haver nova chamada naquele momento

## 8. Sobre o `loadData`

Com React Query, o `loadData` deixa de ser o fluxo principal de busca.

Ele passa a ser um atalho para refetch manual.

Exemplo de uso atual que continua valido:

```ts
await loadData(false);
```

Isso continua funcionando, mas agora por baixo ele chama:

```ts
query.refetch()
```

Importante:
- `refetch()` normalmente busca de novo no servidor
- quem reaproveita cache automaticamente e o `useQuery` pela `queryKey`

Ou seja:
- navegar entre paginas ja visitadas pode usar cache
- chamar `loadData()` manualmente tende a forcar nova busca

## 9. Compatibilidade com o projeto atual

Essa abordagem foi pensada para mudar o minimo possivel fora do `useQuerable`.

De forma geral:
- `useUsers.ts` pode continuar praticamente igual
- `DataTable` pode continuar igual
- a tela de usuarios pode continuar igual

O que precisa mudar fora do hook:
- instalar React Query
- registrar `QueryClientProvider` no `main.tsx`

## 10. Melhorias opcionais depois da migracao

Depois que a integracao basica estiver funcionando, vale considerar:

### Debounce para filtros textuais

Evita request a cada digitacao.

### Invalidacao apos mutacoes

Ao criar, editar ou excluir registros, pode ser melhor invalidar a query em vez de chamar `loadData` manualmente.

Exemplo:

```ts
queryClient.invalidateQueries({ queryKey: ['querable', 'users'] });
```

### Expor `isFetching`

`isLoading` e bom para carga inicial.
`isFetching` ajuda a mostrar quando uma nova consulta esta acontecendo sem apagar a tabela da tela.

## 11. Sugestao de implantacao segura

Ordem recomendada:

1. instalar React Query
2. criar `queryClient.ts`
3. registrar `QueryClientProvider`
4. adaptar apenas o `useQuerable`
5. testar a tela de usuarios
6. validar paginacao, filtro e ordenacao
7. depois expandir para outras listagens

## 12. Resultado esperado

Com essa adicao, o projeto passa a ter:

- cache por pagina/filtro/ordenacao
- menos requests repetidas para queries ja visitadas
- melhor experiencia de navegacao no DataTable
- menos controle manual de loading e fetch no `useQuerable`

Se quiser, o proximo passo natural e gerar a versao final do `useQuerable.ts` ja pronta para colar no projeto.
