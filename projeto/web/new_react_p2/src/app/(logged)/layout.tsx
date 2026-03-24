'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useSseContext } from '@/components/contexts/sse/SSEContext';
import Loading from '../loading';

export default function LayoutAuthOnly({ children }: Readonly<{ children: React.ReactNode }>) {
  const { setSseEnabled } = useSseContext();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  /********************/
  /* UseEffects       */
  /********************/
  useEffect(() => {
    setSseEnabled(isAuthenticated);

    if (!isAuthenticated && !isLoading) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, setSseEnabled]);

  /********************/
  /* Returns          */
  /********************/
  if (isLoading) {
    return <Loading />; // Mostra loading visual
  }

  if (!isAuthenticated) {
    return null; // Evita renderizar conteúdo protegido
  }

  return (
    <div className='h-full flex overflow-hidden'>
      {/* Sidebar */}

      {/* Main Content Area */}
      <div className='h-full flex flex-col flex-1 overflow-hidden'>
        {children}
      </div>
    </div>
  );
}
