import Header from '@/components/layout/Header/Header';
import { redirect, useRouter } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';

export default async function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = true;

  if (authenticated) {
    redirect('/');
  }

  return (
    <>
      {children}
    </>
  );
}
