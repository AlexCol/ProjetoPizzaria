import { TemplateRef } from '@angular/core';
import { Order } from '../../../../api/generated/models';
import { createDataTableColumn } from '../../../../components/shared/data-table/create-data-table-column';
import {
  DataTableCellTemplateContext,
  DataTableColumn,
} from '../../../../components/shared/data-table/data-table.interfaces';

/*****************************************/
/* Tipos                                 */
/*****************************************/
interface CreateHomeTableColumnsOptions {
  statusTemplate?: TemplateRef<DataTableCellTemplateContext<Order>>;
  actionsTemplate?: TemplateRef<DataTableCellTemplateContext<Order>>;
}

/*****************************************/
/* Criacao das Colunas                   */
/*****************************************/
export function createHomeTableColumns({
  statusTemplate,
  actionsTemplate,
}: CreateHomeTableColumnsOptions): DataTableColumn<Order>[] {
  return [
    createDataTableColumn<Order>({
      field: 'tableNumber',
      header: 'Mesa',
      sortField: 'TableNumber',
      filter: { field: 'TableNumber', placeholder: 'Buscar mesa...' },
      width: '7rem',
    }),
    createDataTableColumn<Order>({
      field: 'name',
      header: 'Cliente',
      sortField: 'Name',
      filter: { field: 'Name', placeholder: 'Buscar cliente...' },
      formatter: (value) => String(value || 'Não informado'),
    }),
    createDataTableColumn<Order>({
      field: 'status',
      header: 'Status',
      sortField: 'Status',
      cellTemplate: statusTemplate,
      width: '11rem',
    }),
    createDataTableColumn<Order>({
      field: 'createdAt',
      header: 'Criado em',
      sortField: 'CreatedAt',
      initialSort: 'desc',
      formatter: (value) =>
        value
          ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(String(value)))
          : '',
      width: '12rem',
    }),
    createDataTableColumn<Order>({
      id: 'actions',
      header: 'Pedido',
      sortable: false,
      cellTemplate: actionsTemplate,
      align: 'center',
      width: '9rem',
    }),
  ];
}
