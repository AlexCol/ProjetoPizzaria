'use client';
import Button from '@/components/singles/Button';
import Input from '@/components/singles/Input';
import LinkCustom from '@/components/singles/LinkCustom';
import LogoImage from '@/components/singles/LogoImage';
import { loginStyles } from './login.styles';
import useLogin from './useLogin';

function Login() {
  const { emailRef, passwordRef, rememberMeRef, signInHandler, isLoading, errorMessage } = useLogin();

  return (
    <div className={loginStyles.container}>
      <LogoImage />

      <section className={loginStyles.login}>
        <form onSubmit={signInHandler} className={loginStyles.form}>
          <Input
            type="email"
            placeholder="Email"
            ref={emailRef}
            autoComplete="email"
            disabled={isLoading}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            maxLength={30}
            ref={passwordRef}
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            label={isLoading ? 'Loading...' : 'Acessar'}
          />
          <label className={loginStyles.rememberMeContainer}>
            <input
              type="checkbox"
              name="rememberMe"
              ref={rememberMeRef}
              className={loginStyles.rememberMeCheckBox}
              disabled={isLoading}
            />
            Lembrar-me
          </label>
        </form>
        <LinkCustom
          href="/auth/signup"
          label='Não tem uma conta? Cadastre-se'
          disabled={isLoading}
        />
      </section>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  )
}

export default Login