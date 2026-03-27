import type { DataTableStates } from '../../useDataTable';
import TableBody from './components/TableBody';
import TableHeader from './components/TableHeader';

function DataTableTable<TData = unknown>({ states }: DataTableStates<TData>) {
  const { mergedClassNames } = states;

  return (
    <table className={mergedClassNames.table}>
      <TableHeader states={states} />
      <TableBody states={states} />
    </table>
  );
}

export default DataTableTable;
