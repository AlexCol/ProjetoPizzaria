/*****************************************/
/* Tipos                                 */

import { TemplateRef } from '@angular/core';
import { Category } from '../../../../api/generated/models';
import { createDataTableColumn } from '../../../../components/shared/data-table/create-data-table-column';
import {
  DataTableCellTemplateContext,
  DataTableColumn,
} from '../../../../components/shared/data-table/data-table.interfaces';

/*****************************************/
interface CreateCategoriesTableColumnsOptions {
  actionsTemplate?: TemplateRef<DataTableCellTemplateContext<Category>>;
  showControls: boolean;
}

/*****************************************/
/* Criacao das Colunas                   */
/*****************************************/
export function createCategoriesTableColumns({ actionsTemplate, showControls }: CreateCategoriesTableColumnsOptions) {
  const columns: DataTableColumn<Category>[] = [
    createDataTableColumn<Category>({
      field: 'name',
      header: 'Nome',
      sortField: 'Name',
      filter: { field: 'Name', placeholder: 'Buscar por nome...' },
    }),
  ];

  if (showControls && actionsTemplate) {
    columns.push(
      createDataTableColumn<Category>({
        id: 'actions',
        header: 'Controles',
        sortable: false,
        cellTemplate: actionsTemplate,
        align: 'center',
        width: '8rem',
      }),
    );
  }

  return columns;
}
