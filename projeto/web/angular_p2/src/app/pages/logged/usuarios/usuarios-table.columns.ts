import { TemplateRef } from '@angular/core';
import { createDataTableColumn } from '../../../../components/shared/data-table/create-data-table-column';
import {
  DataTableCellTemplateContext,
  DataTableColumn,
  DataTableFilterOption,
} from '../../../../components/shared/data-table/data-table.interfaces';
import { User } from '../../../../models/User';

/*****************************************/
/* Tipos                                 */
/*****************************************/
interface CreateUsuariosTableColumnsOptions {
  roleOptions: readonly DataTableFilterOption[];
  statusTemplate?: TemplateRef<DataTableCellTemplateContext<User>>;
  actionsTemplate?: TemplateRef<DataTableCellTemplateContext<User>>;
  showControls: boolean;
}

/*****************************************/
/* Criacao das Colunas                   */
/*****************************************/
export function createUsuariosTableColumns({
  roleOptions,
  statusTemplate,
  actionsTemplate,
  showControls,
}: CreateUsuariosTableColumnsOptions): DataTableColumn<User>[] {
  const columns: DataTableColumn<User>[] = [
    createDataTableColumn<User>({
      field: 'name',
      header: 'Nome',
      sortField: 'Name',
      // initialSort: 'asc',
      filter: { field: 'Name', placeholder: 'Buscar por nome...' },
    }),
    createDataTableColumn<User>({ field: 'email', header: 'E-mail', sortField: 'Email' }),
    createDataTableColumn<User>({
      id: 'role',
      header: 'Perfil',
      accessor: (user) => user.role.name,
      sortable: true,
      sortField: 'RoleId',
      filter: {
        type: 'select',
        field: 'RoleId',
        placeholder: 'Todos os perfis',
        options: roleOptions,
      },
    }),
    createDataTableColumn<User>({
      field: 'status',
      header: 'Status',
      sortField: 'Status',
      cellTemplate: statusTemplate,
      width: '11rem',
    }),
  ];

  if (showControls && actionsTemplate) {
    columns.push(
      createDataTableColumn<User>({
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
