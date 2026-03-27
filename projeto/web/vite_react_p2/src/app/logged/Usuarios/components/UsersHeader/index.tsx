import type { UsersStates } from '../../useUsers';
import usersHeaderStyles from './users-header.styles';
import Button from '@/components/singles/Button';

function UsuariosHeader({ states }: UsersStates) {
  const { openModalNovoUsuario, disableButtons } = states;
  return (
    <>
      {/* Header */}
      <div className={usersHeaderStyles.headerTC}>
        <h1 className={usersHeaderStyles.tittleTC}>Usuários</h1>
        <Button
          onClick={openModalNovoUsuario}
          label='Novo Usuario'
          title='Novo Usuario'
          className={usersHeaderStyles.buttonTC}
          disabled={disableButtons}
          buttonType='Info'
        />
      </div>
    </>
  );
}

export default UsuariosHeader;
