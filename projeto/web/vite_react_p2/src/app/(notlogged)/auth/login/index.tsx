import loginStyles from "./login.styles";
import useLogin from "./useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Login() {
  const { emailRef, passwordRef, rememberMeRef, signInHandler } = useLogin();

  return (
    <div className={loginStyles.containerTC}>
      <div className={loginStyles.cardTC}>
        <div className={loginStyles.titleContainerTC}>
          <h1 className={loginStyles.titleH1TC}>Entrar</h1>
          <p className={loginStyles.titlePTC}>Acesse sua conta para continuar.</p>
        </div>

        <form className={loginStyles.formTC} onSubmit={signInHandler}>
          <div className={loginStyles.fieldTC}>
            <Label htmlFor='email'>E-mail</Label>
            <Input
              id='email'
              type='email'
              ref={emailRef}
              placeholder='voce@exemplo.com'
              autoComplete='email'
              required
              className={loginStyles.inputTC}
            />
          </div>

          <div className={loginStyles.fieldTC}>
            <Label htmlFor='password'>Senha</Label>
            <Input
              id='password'
              type='password'
              ref={passwordRef}
              placeholder='Sua senha'
              autoComplete='current-password'
              required
              className={loginStyles.inputTC}
            />
          </div>

          <div className={loginStyles.lembrarAndEsqueciContainerTC}>
            <label htmlFor='remember-me' className={loginStyles.lembrarContainerTC}>
              <input
                id='remember-me'
                type='checkbox'
                ref={rememberMeRef}
                className={loginStyles.lembrarCheckboxTC}
              />
              Lembrar de mim
            </label>

            <button type='button' className={loginStyles.forgotButtonTC}>
              Esqueci minha senha
            </button>
          </div>

          <Button type='submit' variant='default' size='default' className={loginStyles.submitButtonTC}>
            Entrar
          </Button>
        </form>

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
