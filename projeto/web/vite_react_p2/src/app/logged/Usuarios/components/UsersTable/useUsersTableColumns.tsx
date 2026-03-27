
import type { ColumnDef } from '@tanstack/react-table';
import type { UsersStates } from '../../useUsers';
import useCreateDataTableColumn from '@/components/singles/DataTable/hooks/useCreateDataTableColumn';
import type { ResponseUserDto } from '@/services/generated/models';

export function useUsersTableColumns({ states }: UsersStates): ColumnDef<ResponseUserDto>[] {
  const baseTextTC = `font-medium`;

  //!exemplo sem passando customCell
  const nome = useCreateDataTableColumn<ResponseUserDto>({
    field: 'name',
    headerValue: 'Nome',
    cellClassName: baseTextTC,
    enableFiltering: true,
    filterPlaceholder: 'Filtrar por nome...',
  });

  const role = useCreateDataTableColumn<ResponseUserDto>({
    field: 'role',
    headerValue: 'Função',
    cellClassName: baseTextTC,
    enableFiltering: true,
    filterPlaceholder: 'Filtrar por cargo...',
  });

  const status = useCreateDataTableColumn<ResponseUserDto>({
    field: 'status',
    headerValue: 'Status',
    cellClassName: baseTextTC,
  });

  return [nome, role, status];
}
