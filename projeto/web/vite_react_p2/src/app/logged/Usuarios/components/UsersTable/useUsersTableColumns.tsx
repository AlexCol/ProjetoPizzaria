import type { ColumnDef } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';
import type { UsersStates } from '../../useUsers';
import Button from '@/components/singles/Button';
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

  const inconTC = `inline-block w-5 h-5`;
  const actionsButtonTC = `max-w-[50%] py-1!`;
  const acoes = useCreateDataTableColumn<ResponseUserDto>({
    id: 'actions',
    headerValue: 'Ações',
    customCell: ({ row }) => (
      <div className='flex max-w-20'>
        <Button
          key='ver-perfil'
          icon={Pencil}
          iconClassName={inconTC}
          className={actionsButtonTC}
          onClick={async () => {
            await states.openModalEditar(row.original);
          }}
          title='Ver Perfil'
          disabled={states.disableButtons}
          allowSpam
        />
      </div>
    ),
  });

  return [nome, role, status, acoes];
}
