import { useReactTable, type CellContext, type ColumnDef, type HeaderContext } from '@tanstack/react-table';
import { Filter, FilterX } from 'lucide-react';
import { useRef } from 'react';
import PopOver from '../../PopOver';

//?????????????????????????????????????????????????????????????????????????????????????????
//? Tipos
//?????????????????????????????????????????????????????????????????????????????????????????
type FilterOption = {
  label: string;
  value: string;
};

type UseCreateDataTableColumnParams<T> = {
  field?: keyof T & string;
  fieldType?: 'string' | 'number' | 'date';
  id?: string;
  customHeader?: (context: HeaderContext<T, any>) => React.ReactNode;
  headerValue?: string;
  customCell?: (context: CellContext<T, any>) => React.ReactNode;
  cellClassName?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  filterPlaceholder?: string;
  filterType?: 'text' | 'select';
  filterOptions?: FilterOption[];
};

//?????????????????????????????????????????????????????????????????????????????????????????
//? Hook
//?????????????????????????????????????????????????????????????????????????????????????????
export default function useCreateDataTableColumn<T>(params: UseCreateDataTableColumnParams<T>): ColumnDef<T> {
  if (!params.field && !params.id) {
    throw new Error('Você deve fornecer um field ou id para criar a coluna.');
  }

  const column: ColumnDef<T> = {
    ...(params.field ? { accessorKey: params.field } : { id: params.id! }),

    enableSorting: params.enableSorting !== undefined ? params.enableSorting : true,

    header: params.customHeader
      ? params.customHeader
      : params.enableFiltering
        ? ({ column }) => (
            <FilterHeader
              column={column}
              headerValue={params.headerValue}
              filterPlaceholder={params.filterPlaceholder}
              filterType={params.filterType}
              filterOptions={params.filterOptions}
            />
          )
        : () => <span className='font-medium'>{params.headerValue || 'Header'}</span>,

    cell: params.customCell
      ? params.customCell
      : ({ getValue }) => {
          const value = getValue();
          const fieldType = params.fieldType || 'string';

          if (fieldType === 'number') {
            return <span className={`${params.cellClassName} flex pl-10`}>{String(value)}</span>; // Convert to string
          }

          if (fieldType === 'date') {
            return <span className={params.cellClassName}>{new Date(value as string).toLocaleString('pt-BR')}</span>; // Ensure string conversion
          }

          return <span className={params.cellClassName}>{String(value)}</span>; // Convert to string
        },
  };

  return column;
}

//?????????????????????????????????????????????????????????????????????????????????????????
//? Componente adicional, para o header com filtro (grande pois adiciona varios controles)
//?????????????????????????????????????????????????????????????????????????????????????????
function FilterHeader({
  column,
  headerValue,
  filterPlaceholder,
  filterType = 'text',
  filterOptions,
}: {
  column: any;
  headerValue?: string;
  filterPlaceholder?: string;
  filterType?: 'text' | 'select';
  filterOptions?: FilterOption[];
}) {
  useReactTable({} as any); //isso faz a tabela renderizar corretamente quando 'client-side' não sei por que
  const inputValueRef = useRef<string>('');
  const filterValue = column.getFilterValue() as string;
  const hasFilter = filterValue && filterValue.length > 0;

  const handleClearFilter = () => {
    column.setFilterValue('');
    inputValueRef.current = '';
  };

  const handleSelectChange = (value: string) => {
    column.setFilterValue(value);
    inputValueRef.current = value;
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='font-medium'>{headerValue || 'Header'}</span>
      <div onClick={(e) => e.stopPropagation()}>
        {hasFilter ? (
          <button
            onClick={handleClearFilter}
            className='p-1 rounded hover:bg-accent transition-colors text-blue-600'
            title='Limpar filtro'
          >
            <FilterX size={16} />
          </button>
        ) : (
          <PopOver
            trigger={
              <button className='p-1 rounded hover:bg-accent transition-colors text-muted-foreground'>
                <Filter size={16} />
              </button>
            }
            usePortal={true}
          >
            <div className='flex flex-col gap-2 min-w-50' onClick={(e) => e.stopPropagation()}>
              {filterType === 'text' ? (
                <input
                  type='text'
                  placeholder={filterPlaceholder || 'Filtrar...'}
                  onChange={(e) => (inputValueRef.current = e.target.value)}
                  onBlur={(e) => column.setFilterValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      column.setFilterValue(inputValueRef.current);
                    }
                  }}
                  className='px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary'
                  autoFocus
                />
              ) : (
                <select
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className='px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background'
                  autoFocus
                >
                  <option value=''>{filterPlaceholder || 'Selecione...'}</option>
                  {filterOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </PopOver>
        )}
      </div>
    </div>
  );
}
