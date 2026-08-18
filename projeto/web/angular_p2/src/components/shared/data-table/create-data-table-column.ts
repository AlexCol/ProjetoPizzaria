import { CreateDataTableColumnOptions, DataTableColumn } from './data-table.interfaces';

/*****************************************/
/* Criacao de Coluna                     */
/*****************************************/
export function createDataTableColumn<TData>(options: CreateDataTableColumnOptions<TData>): DataTableColumn<TData> {
  const id = options.id ?? options.field;

  if (!id) {
    throw new Error('A coluna deve possuir um field ou id.');
  }

  return {
    ...options,
    id,
    sortable: options.sortable ?? !!options.field,
  };
}
