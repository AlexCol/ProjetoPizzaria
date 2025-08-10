import { redirect } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';

export default async function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = false;

  if (!authenticated) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
