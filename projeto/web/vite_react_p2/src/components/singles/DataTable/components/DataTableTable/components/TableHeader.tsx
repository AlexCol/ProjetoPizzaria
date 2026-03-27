import { flexRender, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import type { DataTableStates } from '../../../useDataTable';

function TableHeader<TData = unknown>({ states }: DataTableStates<TData>) {
  const { table, mergedClassNames } = states;
  useReactTable({} as any); //isso faz a tabela renderizar corretamente quando 'client-side' não sei por que

  return (
    <thead className={mergedClassNames.thead}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className={mergedClassNames.theadRow}>
          {headerGroup.headers.map((header) => (
            <th key={header.id} className={mergedClassNames.th}>
              {header.isPlaceholder ? null : (
                <div
                  className={header.column.getCanSort() ? mergedClassNames.thSortable : 'flex items-center gap-2'}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <span className='text-gray-400'>
                      {header.column.getIsSorted() === 'asc' ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronsUpDown className='h-4 w-4' />
                      )}
                    </span>
                  )}
                </div>
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

export default TableHeader;
