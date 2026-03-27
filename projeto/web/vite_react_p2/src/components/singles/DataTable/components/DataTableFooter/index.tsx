import type { DataTableStates } from '../../useDataTable';
import DataTablePagination from '../DataTablePagination';

function DataTableFooter<TData = unknown>({ states }: DataTableStates<TData>) {
  const { mergedClassNames, startItem, endItem, displayedTotal, showPagination } = states;

  if (displayedTotal === 0) {
    return null;
  }

  return (
    <>
      <div className={mergedClassNames.footer}>
        <p className={mergedClassNames.footerText}>
          Total: <strong>{displayedTotal}</strong> registro(s)
          {showPagination && (
            <strong>
              {' '}
              • Exibindo <strong>{startItem}</strong> a <strong>{endItem}</strong>
            </strong>
          )}
        </p>
      </div>
      {/* Paginação */}
      {showPagination && <DataTablePagination states={states} />}
    </>
  );
}

export default DataTableFooter;
