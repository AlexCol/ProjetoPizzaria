import { TemplateRef } from '@angular/core';
import { Product } from '../../../../api/generated/models';
import { createDataTableColumn } from '../../../../components/shared/data-table/create-data-table-column';
import {
  DataTableCellTemplateContext,
  DataTableColumn,
  DataTableFilterOption,
} from '../../../../components/shared/data-table/data-table.interfaces';

/*****************************************/
/* Tipos                                 */
/*****************************************/
interface CreateProdutosTableColumnsOptions {
  categoryOptions: readonly DataTableFilterOption[];
  imageTemplate?: TemplateRef<DataTableCellTemplateContext<Product>>;
  statusTemplate?: TemplateRef<DataTableCellTemplateContext<Product>>;
  actionsTemplate?: TemplateRef<DataTableCellTemplateContext<Product>>;
  showControls: boolean;
}

/*****************************************/
/* Criacao das Colunas                   */
/*****************************************/
export function createProdutosTableColumns({
  categoryOptions,
  imageTemplate,
  statusTemplate,
  actionsTemplate,
  showControls,
}: CreateProdutosTableColumnsOptions): DataTableColumn<Product>[] {
  const columns: DataTableColumn<Product>[] = [
    createDataTableColumn<Product>({
      id: 'image',
      header: 'Imagem',
      sortable: false,
      cellTemplate: imageTemplate,
      align: 'center',
      width: '7rem',
    }),
    createDataTableColumn<Product>({
      field: 'name',
      header: 'Nome',
      sortField: 'Name',
      filter: { field: 'Name', placeholder: 'Buscar por nome...' },
    }),
    createDataTableColumn<Product>({
      field: 'price',
      header: 'Preço',
      sortField: 'Price',
      formatter: (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value ?? 0)),
      width: '9rem',
    }),
    createDataTableColumn<Product>({
      id: 'category',
      header: 'Categoria',
      accessor: (product) =>
        product.category?.name ??
        categoryOptions.find((option) => String(option.value) === String(product.categoryId))?.label ??
        '',
      sortField: 'CategoryId',
      filter: {
        type: 'select',
        field: 'CategoryId',
        placeholder: 'Todas as categorias',
        options: categoryOptions,
      },
    }),
    createDataTableColumn<Product>({
      field: 'status',
      header: 'Status',
      sortField: 'Status',
      cellTemplate: statusTemplate,
      width: '9rem',
    }),
  ];

  if (showControls && actionsTemplate) {
    columns.push(
      createDataTableColumn<Product>({
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
