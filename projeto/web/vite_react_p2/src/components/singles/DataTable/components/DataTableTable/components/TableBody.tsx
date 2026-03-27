'use client';

import { flexRender, useReactTable } from '@tanstack/react-table';
import type { DataTableStates } from '../../../useDataTable';

function TableBody<TData = unknown>({ states }: DataTableStates<TData>) {
  const { table, columns, mergedClassNames, onRowClick, emptyMessage } = states;
  useReactTable({} as any); //isso faz a tabela renderizar corretamente quando 'client-side' não sei por que

  return (
    <tbody className={mergedClassNames.tbody}>
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={`${mergedClassNames.tbodyRow} ${onRowClick ? 'hover:bg-background-2 cursor-pointer' : mergedClassNames.tbodyRowHover
              }`}
            onClick={() => onRowClick?.(row.original)}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={mergedClassNames.td}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr className={mergedClassNames.emptyRow}>
          <td colSpan={columns.length} className={mergedClassNames.emptyCell}>
            {emptyMessage}
          </td>
        </tr>
      )}
    </tbody>
  );
}

export default TableBody;
