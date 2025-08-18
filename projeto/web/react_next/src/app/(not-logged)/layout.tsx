'use client';
import React, { useEffect } from 'react';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '../loading';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && !isLoading)
      router.push('/');
  }, [isAuthenticated, isLoading])

  if (isLoading)
    return <Loading />;

  if (isAuthenticated)
    return null;

  return (
    <>
      {children}
    </>
  );
}
