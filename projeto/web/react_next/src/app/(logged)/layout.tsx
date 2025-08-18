'use client';
import React, { useEffect } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import Footer from '@/components/layout/Footer/Footer';
import Loading from '../loading';

export default function LayoutAuthOnly({ children, }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading])

  if (isLoading)
    return <Loading />; // Mostra loading visual

  if (!isAuthenticated)
    return null; // Evita renderizar conteúdo protegido

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
