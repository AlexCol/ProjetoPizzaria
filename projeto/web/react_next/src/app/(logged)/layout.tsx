'use client';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import { redirect } from 'next/navigation'; // Corrigido para usar o import correto
import React from 'react';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
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
