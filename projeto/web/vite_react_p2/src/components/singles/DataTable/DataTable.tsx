import DataTableFooter from './components/DataTableFooter';
import DataTableTable from './components/DataTableTable';
import type { DataTableProps } from './interfaces/DataTableProps';
import useDataTable from './useDataTable';

export function DataTable<TData>(props: DataTableProps<TData>) {
  const states = useDataTable(props);
  const { mergedClassNames, isLoading } = states;

  if (isLoading) {
    return (
      <div className={mergedClassNames.loadingContainer}>
        <div className='text-center py-12'>
          <div className={mergedClassNames.loadingSpinner}></div>
          <p className={mergedClassNames.loadingText}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={mergedClassNames.container}>
      <div className={mergedClassNames.tableWrapper}>
        <div className={mergedClassNames.tbodyContainer}>
          <DataTableTable states={states} />
        </div>

        {/* Footer com informações e paginação */}
        <DataTableFooter states={states} />
      </div>
    </div>
  );
}
