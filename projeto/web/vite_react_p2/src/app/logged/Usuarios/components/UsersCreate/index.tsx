import type { UsersStates } from '../../useUsers';
import usuarioCreateStyles from './usuario-create.styles';
import Button from '@/components/singles/Button';
import Form from '@/components/singles/Form';
import Input from '@/components/singles/Input';
import Select from '@/components/singles/Select';

function UsuarioCreate({ states }: UsersStates) {
  const { signUpHandler, handleModalClose } = states; //metodos
  const { emailRef, nameRef, passwordRef, confirmPasswordRef, roleIdRef, roleOptions, isSaving, mode } = states; //estados

  return (
    <div className={usuarioCreateStyles.containerTC}>
      <div className={usuarioCreateStyles.usuarioCreateCardTC}>
        <div className={usuarioCreateStyles.titleContainerTC}>
          {' '}
          {/* Título */}
          <h1 className={usuarioCreateStyles.titleH1TC}>Criar Novo Usuário</h1>
        </div>

        {/* Formulário */}
        <Form className='w-full' onSubmit={signUpHandler} autoComplete='off'>
          <div className={usuarioCreateStyles.formGridTC}>
            {/* Campo de Email - Span 2 colunas */}
            <div className={usuarioCreateStyles.fullWidthFieldTC}>
              <Input
                type='email'
                disabled={isSaving || mode === 'edit'}
                ref={emailRef}
                placeholder='usuario@email.com'
                className={usuarioCreateStyles.inputTC}
                label='Email'
                required
              />
            </div>

            {/* Campo de Nome */}
            <div className={usuarioCreateStyles.fullWidthFieldTC}>
              <Input
                type='text'
                disabled={isSaving}
                ref={nameRef}
                placeholder='Nome'
                className={usuarioCreateStyles.inputTC}
                label='Nome'
                maxLength={30}
                required
              />
            </div>

            <div className={usuarioCreateStyles.fullWidthFieldTC}>
              <Select
                valueRef={roleIdRef}
                label='Cargo'
                options={roleOptions}
                required
                disabled={isSaving}
                classeNames={{
                  selectClassName: usuarioCreateStyles.selectTC,
                }}
              />
            </div>

            {mode === 'create' && (
              <>
                <Input
                  disabled={isSaving}
                  type='password'
                  ref={passwordRef}
                  required
                  placeholder='Senha'
                  className={usuarioCreateStyles.inputTC}
                  label='Senha'
                  autoComplete='new-password'
                />
                <Input
                  disabled={isSaving}
                  type='password'
                  ref={confirmPasswordRef}
                  required
                  placeholder='Confirmar Senha'
                  className={usuarioCreateStyles.inputTC}
                  label='Confirmar Senha'
                  autoComplete='new-password'
                />
              </>
            )}
          </div>

          {/* Botão de Cadastro */}
          <div className='flex justify-end gap-4 pt-3'>
            <Button
              label={isSaving ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Cadastrar'}
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
