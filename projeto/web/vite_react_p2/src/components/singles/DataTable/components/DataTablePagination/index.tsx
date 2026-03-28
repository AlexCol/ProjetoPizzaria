import type { DataTableStates } from '../../useDataTable';
import Button from '@/components/singles/Button';

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
      <div className='flex flex-wrap items-center gap-6'>
        <div className='flex items-center gap-2'>
          <label className='text-sm text-foreground'>Linhas por pagina:</label>
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
          <label className='text-sm text-foreground'>Ir para pagina:</label>
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
      </div>

      <div className='flex flex-wrap items-center gap-2 lg:ml-auto'>
        <Button
          onClick={handleFirstPage}
          disabled={!canPreviousPage}
          className={`${mergedClassNames.paginationButton} !w-auto shrink-0`}
          label='Primeira'
          allowSpam
        />
        <Button
          onClick={handlePreviousPage}
          disabled={!canPreviousPage}
          className={`${mergedClassNames.paginationButton} !w-auto shrink-0`}
          label='Anterior'
          allowSpam
        />
        <span className={mergedClassNames.paginationText}>
          <div>Pagina </div>
          <strong>
            {displayedPage} de {totalPages}
          </strong>
        </span>
        <Button
          onClick={handleNextPage}
          disabled={!canNextPage}
          className={`${mergedClassNames.paginationButton} !w-auto shrink-0`}
          label='Proxima'
          allowSpam
        />
        <Button
          onClick={handleLastPage}
          disabled={!canNextPage}
          className={`${mergedClassNames.paginationButton} !w-auto shrink-0`}
          label='Ultima'
          allowSpam
        />
      </div>
    </div>
  );
}

export default DataTablePagination;
