
import type { UsersStates } from '../../useUsers';
import usuarioCreateStyles from './usuario-create.styles';
import Button from '@/components/singles/Button';
import Form from '@/components/singles/Form';

function UsuarioCreate({ states }: UsersStates) {
  const { signUpHandler, handleModalClose } = states; //metodos
  const { isSaving } = states; //estados

  return (
    <div className={usuarioCreateStyles.containerTC}>
      <div className={usuarioCreateStyles.usuarioCreateCardTC}>
        <div className={usuarioCreateStyles.titleContainerTC}>
          {' '}
          {/* Título */}
          <h1 className={usuarioCreateStyles.titleH1TC}>Criar Novo Usuário</h1>
        </div>

        {/* Formulário */}
        <Form className='w-full' onSubmit={() => { }} autoComplete='off'>
          <div className={usuarioCreateStyles.formGridTC}>
            {/* Campo de Email - Span 2 colunas */}
            {/* <div className={usuarioCreateStyles.fullWidthFieldTC}>
              <Input
                type='email'
                disabled={isSaving}
                ref={emailRef}
                placeholder='usuario@email.com'
                className={usuarioCreateStyles.inputTC}
                label='Email'
                required
              />
            </div> */}

            {/* Campo de Nome */}
            {/* <Input
              type='text'
              disabled={isSaving}
              ref={nomeRef}
              placeholder='Primeiro Nome'
              className={usuarioCreateStyles.inputTC}
              label='Nome'
              maxLength={30}
              required
            /> */}

            {/* Campo de Sobrenome */}
            {/* <Input
              type='text'
              disabled={isSaving}
              ref={sobrenomeRef}
              placeholder='Sobrenome'
              className={usuarioCreateStyles.inputTC}
              label='Sobrenome'
              maxLength={30}
              required
            /> */}

            {/* Campo de Matricula */}
            {/* <Input
              type='text'
              disabled={isSaving}
              ref={matriculaRef}
              placeholder='Matricula'
              className={usuarioCreateStyles.inputTC}
              label='Matricula'
              maxLength={30}
              required
            /> */}

            {/* <Select
              valueRef={tipoUsuarioRef}
              label='Tipo de Usuário'
              options={optionsTipoUsuario}
              required
              disabled={isSaving}
              classeNames={{
                selectClassName: usuarioCreateStyles.selectTC,
              }}
            /> */}

            {/* <div className={usuarioCreateStyles.fullWidthFieldTC}>
              <Select
                valueRef={cargoRef}
                label='Cargo'
                options={cargos.map((cargo) => ({ label: cargo.descricao, value: cargo.id! }))}
                required
                disabled={isSaving}
                classeNames={{
                  selectClassName: usuarioCreateStyles.selectTC,
                }}
              />
            </div> */}

            {/* <PasswordInput
              disabled={isSaving}
              ref={senhaRef}
              placeholder='Senha'
              className={usuarioCreateStyles.inputTC}
              label='Senha'
              autoComplete='new-password'
            />
            <PasswordInput
              disabled={isSaving}
              ref={confirmarSenhaRef}
              placeholder='Confirmar Senha'
              className={usuarioCreateStyles.inputTC}
              label='Confirmar Senha'
              autoComplete='new-password'
            /> */}
          </div>

          {/* Botão de Cadastro */}
          <div className='flex justify-end gap-4 pt-3'>
            <Button
              label={isSaving ? 'Cadastrando...' : 'Cadastrar'}
              buttonType='Success'
              className='py-3'
              type='submit'
              disabled={isSaving}
            />
            <Button onClick={handleModalClose} label='Cancelar' buttonType='Danger' />
          </div>
        </Form>
      </div>
    </div>
  );
}

export default UsuarioCreate;
