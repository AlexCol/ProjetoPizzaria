'use client';
import LogoImage from '@/components/singles/LogoImage';
import Link from 'next/link';
import { loginStyles } from './login.styles';
import useLogin from './useLogin';

function Login() {
  const { emailRef, passwordRef, rememberMeRef, signInHandler, isLoading, errorMessage } = useLogin();

  return (
    <div className={loginStyles.container}>
      <LogoImage />

      <section className={loginStyles.login}>
        <form onSubmit={signInHandler} className={loginStyles.form}>
          <input
            className={loginStyles.input}
            type="email"
            placeholder="Email"
            ref={emailRef}
            autoComplete="email"
            disabled={isLoading}
            required
          />
          <input
            className={loginStyles.input}
            type="password"
            placeholder="Password"
            maxLength={30}
            ref={passwordRef}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={loginStyles.button}
          >
            {isLoading ? 'Loading...' : 'Acessar'}
          </button>
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
        <Link href="/auth/signup" className={loginStyles.link}>
          Não tem uma conta? Cadastre-se
        </Link>
      </section>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  )
}

export default Login