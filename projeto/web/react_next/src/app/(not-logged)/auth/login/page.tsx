'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useTheme } from 'next-themes';
import React from 'react'

function Login() {
  const { signIn, isLoadingAuth } = useAuthContext();

  if (isLoadingAuth)
    return <div>Loading...</div>

  return (
    <>
      <div>Login</div>
      <button onClick={signIn}>Entrar</button>
    </>
  )
}

export default Login