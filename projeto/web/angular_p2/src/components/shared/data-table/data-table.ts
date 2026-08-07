import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  Column,
  ColumnFiltersState,
  FlexRender,
  PaginationState,
  RowData,
  SortingState,
  Updater,
  functionalUpdate,
  injectTable,
} from '@tanstack/angular-table';
import { ButtonComponent } from '../button/button';
import { dataTableStyles } from './data-table.styles';
import {
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableMode,
  DataTableQuery,
  dataTableFeatures,
} from './data-table.types';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  imports: [FlexRender, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'styles.host',
  },
})
export class DataTableComponent<TData extends RowData = RowData> {
  readonly data = input<TData[]>([]);
  readonly columns = input<DataTableColumnDef<TData>[]>([]);
  readonly mode = input<DataTableMode>('client');
  readonly totalItems = input(0, { transform: numberAttribute });
  readonly pageSize = input(20, { transform: numberAttribute });
  readonly pageSizeOptions = input<readonly number[]>([10, 20, 30, 50]);
  readonly emptyMessage = input('Nenhum dado encontrado');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly showPagination = input(true, { transform: booleanAttribute });
  readonly rowClickable = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('Tabela de dados');
  readonly className = input('');

  readonly rowClick = output<TData>();
  readonly queryChange = output<DataTableQuery>();

  protected readonly pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 20 });
  protected readonly sorting = signal<SortingState>([]);
  protected readonly columnFilters = signal<ColumnFiltersState>([]);
  protected readonly goToPageValue = signal('');
  protected readonly isServerSide = computed(() => this.mode() === 'server');
  protected readonly normalizedTotalItems = computed(() => Math.max(0, this.totalItems()));
  protected readonly resolvedColumns = computed(() => {
    return this.columns().map((column) => {
      const meta = column.meta;
      if (!meta?.filter) {
        return column;
      }

      return {
        ...column,
        enableColumnFilter: column.enableColumnFilter ?? true,
        filterFn: column.filterFn ?? (meta.filter.type === 'select' ? 'equalsString' : 'includesString'),
      } satisfies DataTableColumnDef<TData>;
    });
  });

  protected readonly table = injectTable(() => ({
    features: dataTableFeatures,
    data: this.data(),
    columns: this.resolvedColumns(),
    state: {
      pagination: this.pagination(),
      sorting: this.sorting(),
      columnFilters: this.columnFilters(),
    },
    onPaginationChange: (updater) => this.updatePagination(updater),
    onSortingChange: (updater) => this.updateSorting(updater),
    onColumnFiltersChange: (updater) => this.updateFilters(updater),
    manualPagination: this.isServerSide(),
    manualSorting: this.isServerSide(),
    manualFiltering: this.isServerSide(),
    rowCount: this.isServerSide() ? this.normalizedTotalItems() : undefined,
    enableMultiSort: false,
  }));

  protected readonly normalizedPageSizeOptions = computed(() => {
    const currentPageSize = this.pagination().pageSize;
    const values = [currentPageSize, ...this.pageSizeOptions()]
      .map((value) => Math.trunc(value))
      .filter((value, index, items) => value > 0 && items.indexOf(value) === index);

    return values.length > 0 ? values.sort((first, second) => first - second) : [10, 20, 30, 50];
  });
  protected readonly containerClasses = computed(() => {
    const additionalClasses = this.className().trim();
    return additionalClasses ? `${dataTableStyles.container} ${additionalClasses}` : dataTableStyles.container;
  });
  protected readonly rows = computed(() => this.table.getRowModel().rows);
  protected readonly pageCount = computed(() => this.table.getPageCount());
  protected readonly currentPage = computed(() => {
    const totalPages = this.pageCount();
    return totalPages === 0 ? 0 : this.pagination().pageIndex + 1;
  });
  protected readonly displayedTotal = computed(() => {
    return this.isServerSide() ? this.normalizedTotalItems() : this.table.getPrePaginatedRowModel().rows.length;
  });
  protected readonly startItem = computed(() => {
    if (this.displayedTotal() === 0) {
      return 0;
    }

    return this.pagination().pageIndex * this.pagination().pageSize + 1;
  });
  protected readonly endItem = computed(() => {
    return Math.min(this.startItem() + this.rows().length - 1, this.displayedTotal());
  });
  protected readonly canPreviousPage = computed(() => this.table.getCanPreviousPage());
  protected readonly canNextPage = computed(() => this.table.getCanNextPage());

  constructor() {
    effect(() => {
      const configuredPageSize = Math.max(1, Math.trunc(this.pageSize()));

      untracked(() => {
        const current = this.pagination();
        if (current.pageSize !== configuredPageSize) {
          this.pagination.set({ pageIndex: 0, pageSize: configuredPageSize });
        }
      });
    });
  }

  protected get styles() {
    return dataTableStyles;
  }

  protected columnMeta(column: Column<typeof dataTableFeatures, TData, unknown>): DataTableColumnMeta {
    return column.columnDef.meta ?? {};
  }

  protected filterValue(column: Column<typeof dataTableFeatures, TData, unknown>): string {
    const value = column.getFilterValue();
    return value === null || value === undefined ? '' : String(value);
  }

  protected applyTextFilter(column: Column<typeof dataTableFeatures, TData, unknown>, event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    if (value !== this.filterValue(column)) {
      column.setFilterValue(value || undefined);
    }
  }

  protected applySelectFilter(column: Column<typeof dataTableFeatures, TData, unknown>, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    column.setFilterValue(value || undefined);
  }

  protected clearFilter(column: Column<typeof dataTableFeatures, TData, unknown>): void {
    column.setFilterValue(undefined);
  }

  protected toggleSorting(column: Column<typeof dataTableFeatures, TData, unknown>, event: MouseEvent): void {
    column.toggleSorting(undefined, event.shiftKey);
  }

  protected sortLabel(column: Column<typeof dataTableFeatures, TData, unknown>): string {
    const direction = column.getIsSorted();
    if (direction === 'asc') {
      return 'Ordenado de forma crescente';
    }
    if (direction === 'desc') {
      return 'Ordenado de forma decrescente';
    }
    return 'Não ordenado';
  }

  protected handleRowClick(row: TData, event: MouseEvent): void {
    if (!this.rowClickable()) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }

    this.rowClick.emit(row);
  }

  protected changePageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    this.table.setPageSize(pageSize);
  }

  protected updateGoToPage(event: Event): void {
    this.goToPageValue.set((event.target as HTMLInputElement).value);
  }

  protected goToPage(): void {
    const page = Number(this.goToPageValue());
    if (Number.isInteger(page) && page >= 1 && page <= this.pageCount()) {
      this.table.setPageIndex(page - 1);
    }

    this.goToPageValue.set('');
  }

  protected firstPage(): void {
    this.table.firstPage();
  }

  protected previousPage(): void {
    this.table.previousPage();
  }

  protected nextPage(): void {
    this.table.nextPage();
  }

  protected lastPage(): void {
    this.table.lastPage();
  }

  private updatePagination(updater: Updater<PaginationState>): void {
    const next = functionalUpdate(updater, this.pagination());
    this.pagination.set(next);
    this.emitQueryIfServerSide();
  }

  private updateSorting(updater: Updater<SortingState>): void {
    this.sorting.update((current) => functionalUpdate(updater, current));
    this.pagination.update((current) => ({ ...current, pageIndex: 0 }));
    this.emitQueryIfServerSide();
  }

  private updateFilters(updater: Updater<ColumnFiltersState>): void {
    this.columnFilters.update((current) => functionalUpdate(updater, current));
    this.pagination.update((current) => ({ ...current, pageIndex: 0 }));
    this.emitQueryIfServerSide();
  }

  private emitQueryIfServerSide(): void {
    if (!this.isServerSide()) {
      return;
    }

    const sorting = this.sorting()[0];
    this.queryChange.emit({
      page: this.pagination().pageIndex + 1,
      pageSize: this.pagination().pageSize,
      filters: this.columnFilters().map((filter) => ({
        field: filter.id,
        value: filter.value,
      })),
      ...(sorting
        ? {
            sorting: {
              field: sorting.id,
              direction: sorting.desc ? 'desc' : 'asc',
            },
          }
        : {}),
    });
  }
}
