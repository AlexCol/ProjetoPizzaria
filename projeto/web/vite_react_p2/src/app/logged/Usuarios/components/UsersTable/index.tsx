
import type { UsersStates } from '../../useUsers';
import { useUsersTableColumns } from './useUsersTableColumns';
import { DataTable } from '@/components/singles/DataTable/DataTable';

function UsuariosTable({ states }: UsersStates) {
  const { dadosUsuarios, isLoading } = states;

  const columns = useUsersTableColumns({ states });

  return (
    <div className='max-h-[90%]'>
      <DataTable
        // data={dadosUsuarios?.data || []}
        data={dadosUsuarios || []}
        columns={columns}
        emptyMessage='Nenhum usuário encontrado'
        showPagination={true}
        isLoading={isLoading}
      //datatableServerSideManager={datatableServerSideManager}
      />
    </div>
  );
}

export default UsuariosTable;
