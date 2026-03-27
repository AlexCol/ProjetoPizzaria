import type { DataTableClassNames } from "./interfaces/DataTableClassNames";

const containeTC = `h-full overflow-hidden`;
const tableWrapperTC = `h-full flex flex-col bg-background`;
const tableTC = `w-full table-fixed`;
const theadTC = `sticky top-0 z-10`;
const theadRowTC = ` bg-background-2 border-b border-border`;
const thTC = `px-6 py-4 text-left text-sm font-semibold text-primary-text`;
const thSortableTC = `flex items-center gap-2 cursor-pointer select-none hover:text-primary`;
const tbodyTC = ``;
const tbodyContainerTC = `flex-1 overflow-auto scrollbar-stable sidebar-scrollbar-personalizado`;
const tbodyRowTC = `border-b border-border transition-colors`;
const tbodyRowHoverTC = `hover:bg-background-2`;
const tdTC = `px-6 py-2 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap align-middle`;
const emptyRowTC = ``;
const emptyCellTC = `text-center py-12 text-foreground text-lg`;
const footerTC = `px-6 py-4 bg-background-2 border-t border-border`;
const footerTextTC = `text-sm text-foreground`;
const paginationContainerTC = `flex items-center justify-between rounded-lg px-6 p-4`;
const paginationSelectTC = `border border-border rounded px-3 py-0.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`;
const paginationButtonTC = `px-3 py-1.5! text-sm border border-border`;
const paginationButtonDisabledTC = ``;
const paginationTextTC = `flex flex-col items-center text-sm text-foreground w-20 px-4 whitespace-nowrap`;
const loadingContainerTC = `bg-background rounded-lg shadow overflow-hidden`;
const loadingSpinnerTC = `inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent`;
const loadingTextTC = `mt-4 text-foreground`;

export const defaultClassNames: DataTableClassNames = {
  container: containeTC,
  tableWrapper: tableWrapperTC,
  table: tableTC,
  thead: theadTC,
  theadRow: theadRowTC,
  th: thTC,
  thSortable: thSortableTC,
  tbody: tbodyTC,
  tbodyContainer: tbodyContainerTC,
  tbodyRow: tbodyRowTC,
  tbodyRowHover: tbodyRowHoverTC,
  td: tdTC,
  emptyRow: emptyRowTC,
  emptyCell: emptyCellTC,
  footer: footerTC,
  footerText: footerTextTC,
  paginationContainer: paginationContainerTC,
  paginationSelect: paginationSelectTC,
  paginationButton: paginationButtonTC,
  paginationButtonDisabled: paginationButtonDisabledTC,
  paginationText: paginationTextTC,
  loadingContainer: loadingContainerTC,
  loadingSpinner: loadingSpinnerTC,
  loadingText: loadingTextTC,
};
