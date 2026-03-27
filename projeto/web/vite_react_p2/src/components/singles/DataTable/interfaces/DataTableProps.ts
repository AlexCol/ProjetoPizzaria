import type { ColumnDef } from '@tanstack/react-table';
import type { DataTableClassNames } from './DataTableClassNames';

export type DataTableServerSideManager = {
  where: {
    // Filtros controlados (server-side)
    filters: { field: string; value: any }[];
    onFiltersChange: (filters: { field: string; value: any }[]) => void;
  };
  ordernation: {
    // Ordenação controlada (server-side)
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  };
  pagination: {
    // Paginação controlada (server-side)
    totalItems: number;
    currentPage: number;
    pageSize: number;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
};

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  emptyMessage?: string;
  showPagination?: boolean;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  classNames?: DataTableClassNames;

  datatableServerSideManager?: DataTableServerSideManager;
}
