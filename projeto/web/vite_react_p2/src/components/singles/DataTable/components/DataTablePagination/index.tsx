import type { DataTableStates } from '../../useDataTable';
import Button from '@/components/singles/Button';
// ...existing code...

function DataTablePagination<TData = unknown>({ states }: DataTableStates<TData>) {
  const {
    mergedClassNames,
    pageSize,
    pageSizeOptions,
    handlePageSizeChange,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    canPreviousPage,
    canNextPage,
    totalPages,
    displayedPage,
    handleGoToPage,
    goToPage,
    setGoToPage,
  } = states;

  return (
    <div className={mergedClassNames.paginationContainer}>
      {/* Bloco de lista de itens por pagina */}
      <div className='flex items-center gap-2'>
        <label className='text-sm text-foreground'>Linhas por página:</label>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className={mergedClassNames.paginationSelect}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className='flex items-center gap-2'>
        <label className='text-sm text-foreground'>Ir para página:</label>
        <input
          type='number'
          value={goToPage}
          onChange={(e) => setGoToPage(e.target.value)}
          onKeyDown={handleGoToPage}
          placeholder='#'
          className={`${mergedClassNames.paginationSelect} w-16 text-center no-spinner`}
        />
        <span className='text-xs text-foreground opacity-70'>de {totalPages}</span>
      </div>

      {/* Bloco de navegação entre páginas */}
      <div className='flex items-center gap-2'>
        <Button
          onClick={handleFirstPage}
          disabled={!canPreviousPage}
          className={mergedClassNames.paginationButton}
          label='Primeira'
          allowSpam
        />
        <Button
          onClick={handlePreviousPage}
          disabled={!canPreviousPage}
          className={mergedClassNames.paginationButton}
          label='Anterior'
          allowSpam
        />
        <span className={mergedClassNames.paginationText}>
          <div>Página </div>
          <strong>
            {displayedPage} de {totalPages}
          </strong>
        </span>
        <Button
          onClick={handleNextPage}
          disabled={!canNextPage}
          className={mergedClassNames.paginationButton}
          label='Próxima'
          allowSpam
        />
        <Button
          onClick={handleLastPage}
          disabled={!canNextPage}
          className={mergedClassNames.paginationButton}
          label='Última'
          allowSpam
        />
      </div>
    </div>
  );
}

export default DataTablePagination;
