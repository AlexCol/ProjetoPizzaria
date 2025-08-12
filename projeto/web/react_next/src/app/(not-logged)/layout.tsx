'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { redirect } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';
import Loading from '../loading';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, isLoadingAuth } = useAuthContext();

  if (isLoadingAuth)
    return (<Loading />);

  if (isAuthenticated)
    redirect('/');

  return (
    <>
      {children}
    </>
  );
}
