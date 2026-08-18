import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  functionalUpdate,
  injectTable,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/angular-table';
import { PopoverComponent } from '../popover/popover';
import {
  DataTableColumn,
  DataTableFilterValue,
  DataTableMode,
  DataTableQuery,
} from './data-table.interfaces';
import { dataTableStyles } from './data-table.styles';

const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

type DataTableFeatures = typeof dataTableFeatures;

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  host: { '[class]': 'styles.host' },
  imports: [NgTemplateOutlet, PopoverComponent],
})
export class DataTableComponent<TData extends Record<string, any>> {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterTimers = new Map<string, ReturnType<typeof setTimeout>>();
  readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });
  private readonly sorting = signal<SortingState>([]);
  private readonly columnFilters = signal<ColumnFiltersState>([]);
  private initialSortApplied = false;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly data = input.required<TData[]>();
  readonly columns = input.required<readonly DataTableColumn<TData>[]>();
  readonly mode = input<DataTableMode>('local');
  readonly total = input(0);
  readonly loading = input(false);
  readonly emptyMessage = input('Nenhum registro encontrado.');
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50]);
  readonly queryChange = output<DataTableQuery>();

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = dataTableStyles;

  readonly columnDefinitions = computed<ColumnDef<DataTableFeatures, TData, unknown>[]>(() =>
    this.columns().map((column) => {
      const definition = {
        id: column.id,
        header: column.header,
        enableSorting: column.sortable !== false,
        enableColumnFilter: !!column.filter,
        filterFn: column.filter?.type === 'select' ? 'equalsString' : 'includesString',
        ...(column.accessor
          ? { accessorFn: column.accessor }
          : column.field
            ? { accessorKey: column.field }
            : {}),
      };

      return definition as ColumnDef<DataTableFeatures, TData, unknown>;
    }),
  );

  readonly table = injectTable<DataTableFeatures, TData>(() => ({
    features: dataTableFeatures,
    data: this.data(),
    columns: this.columnDefinitions(),
    state: {
      pagination: this.pagination(),
      sorting: this.sorting(),
      columnFilters: this.columnFilters(),
    },
    onPaginationChange: (updater) => {
      this.pagination.update((current) => functionalUpdate(updater, current));
      this.emitQueryWhenServerSide();
    },
    onSortingChange: (updater) => {
      this.sorting.update((current) => functionalUpdate(updater, current));
      this.pagination.update((current) => ({ ...current, pageIndex: 0 }));
      this.emitQueryWhenServerSide();
    },
    onColumnFiltersChange: (updater) => {
      this.columnFilters.update((current) => functionalUpdate(updater, current));
      this.pagination.update((current) => ({ ...current, pageIndex: 0 }));
      this.emitQueryWhenServerSide();
    },
    manualFiltering: this.mode() === 'server',
    manualSorting: this.mode() === 'server',
    manualPagination: this.mode() === 'server',
    rowCount: this.mode() === 'server' ? this.total() : undefined,
    enableSortingRemoval: false,
  }));

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly displayedTotal = computed(() =>
    this.mode() === 'server' ? this.total() : this.table.getFilteredRowModel().rows.length,
  );
  readonly totalPages = computed(() => Math.max(1, this.table.getPageCount()));
  readonly currentPage = computed(() => this.pagination().pageIndex + 1);
  readonly rangeStart = computed(() =>
    this.displayedTotal() === 0 ? 0 : this.pagination().pageIndex * this.pagination().pageSize + 1,
  );
  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pagination().pageSize, this.displayedTotal()),
  );
  readonly visiblePages = computed(() => {
    const start = Math.max(1, Math.min(this.currentPage() - 2, this.totalPages() - 4));
    const end = Math.min(this.totalPages(), start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    effect(() => {
      const initialSortColumn = this.columns().find((column) => column.initialSort);
      if (!initialSortColumn?.initialSort || this.initialSortApplied) return;

      this.sorting.set([{ id: initialSortColumn.id, desc: initialSortColumn.initialSort === 'desc' }]);
      this.initialSortApplied = true;
    });

    effect(() => {
      const lastPageIndex = this.totalPages() - 1;
      if (this.pagination().pageIndex > lastPageIndex) {
        this.table.setPageIndex(lastPageIndex);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.filterTimers.forEach((timer) => clearTimeout(timer));
      this.filterTimers.clear();
    });
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  getColumnConfig(columnId: string): DataTableColumn<TData> {
    const column = this.columns().find((item) => item.id === columnId);
    if (!column) throw new Error(`Coluna ${columnId} nao encontrada.`);
    return column;
  }

  getCellClass(column: DataTableColumn<TData>, row: TData): string {
    const customClass = typeof column.cellClassName === 'function' ? column.cellClassName(row) : column.cellClassName;
    const alignment = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
    return [this.styles.cell, alignment, customClass ?? ''].filter(Boolean).join(' ');
  }

  formatCell(column: DataTableColumn<TData>, value: unknown, row: TData): string | number {
    if (column.formatter) return column.formatter(value, row);
    if (value === null || value === undefined) return '';
    return typeof value === 'string' || typeof value === 'number' ? value : String(value);
  }

  toggleSorting(columnId: string): void {
    const column = this.table.getColumn(columnId);
    if (!column?.getCanSort()) return;
    column.toggleSorting(column.getIsSorted() === 'asc');
  }

  sortIndicator(columnId: string): string {
    const sorted = this.table.getColumn(columnId)?.getIsSorted();
    return sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '';
  }

  ariaSort(columnId: string): 'ascending' | 'descending' | 'none' {
    const sorted = this.table.getColumn(columnId)?.getIsSorted();
    return sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';
  }

  filterValue(columnId: string): DataTableFilterValue | '' {
    const value = this.table.getColumn(columnId)?.getFilterValue();
    return typeof value === 'string' || typeof value === 'number' ? value : '';
  }

  hasFilter(columnId: string): boolean {
    const value = this.filterValue(columnId);
    return value !== '';
  }

  handleTextFilter(columnId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const currentTimer = this.filterTimers.get(columnId);
    if (currentTimer) clearTimeout(currentTimer);

    this.filterTimers.set(
      columnId,
      setTimeout(() => {
        this.setColumnFilter(columnId, value);
        this.filterTimers.delete(columnId);
      }, 350),
    );
  }

  handleSelectFilter(columnId: string, event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const options = this.getColumnConfig(columnId).filter?.options ?? [];
    const value = options.find((option) => String(option.value) === selectedValue)?.value ?? selectedValue;

    this.setColumnFilter(columnId, value);
  }

  clearFilter(columnId: string): void {
    this.setColumnFilter(columnId, '');
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.table.setPageIndex(page - 1);
  }

  changePageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    this.table.setPageSize(pageSize);
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private setColumnFilter(columnId: string, value: DataTableFilterValue | ''): void {
    this.columnFilters.update((current) => {
      const filters = current.filter((filter) => filter.id !== columnId);
      return value === '' ? filters : [...filters, { id: columnId, value }];
    });
    this.pagination.update((current) => ({ ...current, pageIndex: 0 }));
    this.emitQueryWhenServerSide();
  }

  private emitQueryWhenServerSide(): void {
    if (this.mode() !== 'server') return;

    const sorting = this.sorting()[0];
    const sortColumn = sorting ? this.getColumnConfig(sorting.id) : undefined;
    const filters = this.columnFilters()
      .filter((filter) => filter.value !== '')
      .map((filter) => {
        const config = this.getColumnConfig(filter.id);
        return {
          field: config.filter?.field ?? config.id,
          value: filter.value as DataTableFilterValue,
        };
      });

    this.queryChange.emit({
      page: this.pagination().pageIndex + 1,
      limit: this.pagination().pageSize,
      sortField: sortColumn ? sortColumn.sortField ?? sortColumn.id : undefined,
      sortOrder: sorting?.desc ? 'desc' : sorting ? 'asc' : undefined,
      filters,
    });
  }
}
