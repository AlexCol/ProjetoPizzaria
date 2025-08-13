'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import React from 'react'

function ButtonSair() {
  const { signOut } = useAuthContext();
  return (
    <button onClick={signOut}>Sair</button>
  )
}

export default ButtonSair