'use client';
import React, { useEffect } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../loading';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated)
      router.push('/');
  }, [isAuthenticated])

  if (isLoadingAuth)
    return null;

  if (!isAuthenticated)
    return (
      <>
        {children}
      </>
    );
}
