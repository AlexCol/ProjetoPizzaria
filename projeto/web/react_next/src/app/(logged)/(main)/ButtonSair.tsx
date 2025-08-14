'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useTheme } from 'next-themes';
import React from 'react'

function ButtonSair() {
  const { signOut } = useAuthContext();
  const { setTheme } = useTheme();
  return (
    <div className="flex flex-col gap-2">
      <button onClick={signOut}>Sair</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  )
}

export default ButtonSair