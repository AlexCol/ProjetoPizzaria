'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { redirect } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <>
      {children}
    </>
  );
}
