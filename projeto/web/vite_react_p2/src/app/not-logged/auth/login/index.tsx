import { LockIcon } from 'lucide-react';
import loginStyles from './login.styles';
import useLogin from './useLogin';
import Button from '@/components/singles/Button';
import Form from '@/components/singles/Form';
import Icon from '@/components/singles/Icon';
import Input from '@/components/singles/Input';

function Login() {
  const { emailRef, passwordRef, rememberMeRef, signInHandler } = useLogin();

  return (
    <div className={loginStyles.containerTC}>
      <div className={loginStyles.cardTC}>
        <Icon // {/* Logo/Ícone */}
          icon={LockIcon}
          containerClassName='mb-6'
          iconContainerClassName='w-16 h-16'
          iconClassName='w-10 h-10'
          pulse={true}
        />

        <div className={loginStyles.titleContainerTC}>
          <h1 className={loginStyles.titleH1TC}>Pizzaria Coletti</h1>
          <p className={loginStyles.titlePTC}>Acesse sua conta para continuar.</p>
        </div>

        <Form className={loginStyles.formTC} onSubmit={signInHandler}>
          <div className={loginStyles.fieldTC}>
            <Input
              type='email'
              ref={emailRef}
              placeholder='voce@exemplo.com'
              autoComplete='email'
              label='E-Mail'
              required
              className={loginStyles.inputTC}
            />
          </div>

          <div className={loginStyles.fieldTC}>
            <Input
              type='password'
              ref={passwordRef}
              placeholder='Sua senha'
              autoComplete='current-password'
              required
              label='Senha'
              className={loginStyles.inputTC}
            />
          </div>

          <div className={loginStyles.lembrarAndEsqueciContainerTC}>
            <label htmlFor='remember-me' className={loginStyles.lembrarContainerTC}>
              <input id='remember-me' type='checkbox' ref={rememberMeRef} className={loginStyles.lembrarCheckboxTC} />
              Lembrar de mim
            </label>

            <button type='button' className={loginStyles.forgotButtonTC}>
              Esqueci minha senha
            </button>
          </div>

          <Button type='submit' className={loginStyles.submitButtonTC} label='Entrar' />
        </Form>

        <p className={loginStyles.registrarContainerTC}>
          <span className={loginStyles.registrarLabelTC}>Nao tem conta? </span>
          <a href='/auth/register' className={loginStyles.registerLinkTC}>
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
