import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import { redirect } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';

export default async function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const authenticated = false;

  if (!authenticated) {
    redirect('/auth/login');
  }

  return (
    <>
      <Header />
      <Main>
        {children}
      </Main>
      <Footer />
    </>

  );
}
