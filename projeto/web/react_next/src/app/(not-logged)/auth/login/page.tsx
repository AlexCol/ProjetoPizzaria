'use client';
import React from 'react';
import { loginStyles } from './login.styles';
import Link from 'next/link';
import useLogin from './useLogin';

function Login() {
  const { emailRef, passwordRef, rememberMeRef, signInHandler, isLoading, error, message } = useLogin();

  return (
    <div className={loginStyles.container}>
      {/* <Image
        src="/images/logo3.png"
        alt="Pizzaria Coletti"
        title="Pizzaria Coletti"
        width={250}
        height={250}
        className={loginStyles.logo}
        priority
      /> */}

      <section className={loginStyles.login}>
        <form onSubmit={signInHandler} className={loginStyles.form}>
          <input
            className={loginStyles.input}
            type="email"
            placeholder="Email"
            ref={emailRef}
            autoComplete="email"
            required
          />
          <input
            className={loginStyles.input}
            type="password"
            placeholder="Password"
            ref={passwordRef}
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
            />
            Lembrar-me
          </label>
        </form>
        <Link href="/auth/register" className={loginStyles.link}>
          Não posso uma conta? Cadastra-se
        </Link>
      </section>
      {error && <div className="text-red-500">{message}</div>}
    </div>
  )
}

export default Login