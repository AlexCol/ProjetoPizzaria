import UsuarioCreate from './components/UsersCreate';
import UsuariosHeader from './components/UsersHeader';
import UsuariosTable from './components/UsersTable';
import setoresStyles from './users.styles';
import useUsers from './useUsers';
import LoadingTailwind from '@/components/singles/LoadingTailwind';
import { Modal } from '@/components/singles/Modal';

function Users() {
  const states = useUsers();

  if (states.isLoading) {
    return <LoadingTailwind />;
  }

  return (
    <div className={setoresStyles.containerTC}>
      <div className={setoresStyles.innerContainerTC}>
        <UsuariosHeader states={states} />
        <UsuariosTable states={states} />
      </div>

      <Modal isOpen={states.isModalOpen} onClose={states.handleModalClose}>
        <UsuarioCreate states={states} />
      </Modal>
    </div>
  );
}
export default Users;
