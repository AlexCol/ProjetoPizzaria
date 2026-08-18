import { TemplateRef } from '@angular/core';

/*****************************************/
/* Tipos Base                            */
/*****************************************/
export type DataTableMode = 'local' | 'server';
export type DataTableSortOrder = 'asc' | 'desc';
export type DataTableFilterValue = string | number;

/*****************************************/
/* Filtros                               */
/*****************************************/
export interface DataTableFilterOption {
  label: string;
  value: DataTableFilterValue;
}

export interface DataTableFilterConfig {
  type?: 'text' | 'select';
  field?: string;
  placeholder?: string;
  options?: readonly DataTableFilterOption[];
}

/*****************************************/
/* Colunas e Celulas                     */
/*****************************************/
export interface DataTableCellTemplateContext<TData> {
  $implicit: TData;
  row: TData;
  value: unknown;
}

export interface DataTableColumn<TData> {
  id: string;
  header: string;
  field?: keyof TData & string;
  accessor?: (row: TData) => unknown;
  formatter?: (value: unknown, row: TData) => string | number;
  cellTemplate?: TemplateRef<DataTableCellTemplateContext<TData>>;
  cellClassName?: string | ((row: TData) => string);
  sortable?: boolean;
  sortField?: string;
  initialSort?: DataTableSortOrder;
  filter?: DataTableFilterConfig;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/*****************************************/
/* Consulta e Estado Inicial             */
/*****************************************/
export interface DataTableFilter {
  field: string;
  value: DataTableFilterValue;
}

export interface DataTableQuery {
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: DataTableSortOrder;
  filters: DataTableFilter[];
}

/*****************************************/
/* Helper de Coluna                      */
/*****************************************/
export interface CreateDataTableColumnOptions<TData> extends Omit<DataTableColumn<TData>, 'id'> {
  id?: string;
}
