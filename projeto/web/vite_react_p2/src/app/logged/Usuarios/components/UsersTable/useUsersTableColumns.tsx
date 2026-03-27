import type { ColumnDef } from '@tanstack/react-table';
import type { UsersStates } from '../../useUsers';
import useCreateDataTableColumn from '@/components/singles/DataTable/hooks/useCreateDataTableColumn';
import type { ResponseUserDto, RoleDto } from '@/services/generated/models';

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
    enableFiltering: false,
    filterPlaceholder: 'Filtrar por cargo...',
    customCell: ({ getValue }) => {
      const role = getValue() as RoleDto;
      return <span key={Math.random()}>{role.name}</span>;
    }
  });

  const status = useCreateDataTableColumn<ResponseUserDto>({
    field: 'status',
    headerValue: 'Status',
    cellClassName: baseTextTC,
    enableFiltering: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Ativo', value: 'active' },
      { label: 'Inativo', value: 'inactive' },
    ],
  });

  return [nome, role, status];
}
