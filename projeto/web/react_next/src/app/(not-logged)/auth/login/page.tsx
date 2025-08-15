'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import React from 'react';
import { loginStyles } from './login.styles';
import Image from 'next/image';
import Link from 'next/link';

function Login() {
  const { signIn, isLoadingAuth } = useAuthContext();

  if (isLoadingAuth)
    return <div>Loading...</div>

  return (
    <div className={loginStyles.container}>
      <Image
        src="/images/logo.png"
        alt="Pizzaria Coletti"
        title="Pizzaria Coletti"
        width={150}
        height={150}
      />

      <section className={loginStyles.login}>
        <form onSubmit={signIn} className={loginStyles.form}>
          <input
            className={loginStyles.input}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className={loginStyles.input}
            type="password"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={isLoadingAuth}
            className={loginStyles.button}
          >
            {isLoadingAuth ? 'Loading...' : 'Acessar'}
          </button>
        </form>
        <Link href="/auth/register" className={loginStyles.link}>
          Registrar minha empresa
        </Link>
      </section>
    </div>
  )
}

export default Login