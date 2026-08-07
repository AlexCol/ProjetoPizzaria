import {
  ColumnDef,
  RowData,
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/angular-table';

export type DataTableMode = 'client' | 'server';
export type DataTableFilterType = 'text' | 'select';
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableColumnFilter {
  type?: DataTableFilterType;
  placeholder?: string;
  options?: readonly DataTableFilterOption[];
}

export interface DataTableColumnMeta {
  filter?: DataTableColumnFilter;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableQueryFilter {
  field: string;
  value: unknown;
}

export interface DataTableQuerySorting {
  field: string;
  direction: DataTableSortDirection;
}

export interface DataTableQuery {
  page: number;
  pageSize: number;
  filters: DataTableQueryFilter[];
  sorting?: DataTableQuerySorting;
}

/**
 * Recursos compartilhados por todas as instâncias. Mantê-los fora do componente
 * evita recriar as configurações sempre que um Signal da tabela mudar.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    equalsString: filterFn_equalsString,
  },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

/** Definição aceita pelo input `columns` do app-data-table. */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>;

/**
 * Cria o helper tipado do TanStack já configurado para o app-data-table.
 *
 * @example
 * const columns = createDataTableColumnHelper<Usuario>();
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

