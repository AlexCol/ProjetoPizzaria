'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import GradientBackground from '@/components/singles/GradientBackground';
import Loading from '../loading';

export default function LayoutUnAuthOnly({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  /********************/
  /* UseEffects       */
  /********************/
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  /********************/
  /* Returns          */
  /********************/
  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <GradientBackground />
      {children}
    </>
  );
}
