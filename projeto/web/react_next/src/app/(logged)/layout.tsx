'use client';

import { useRouter } from 'next/navigation'; // Corrigido o import
import React, { useContext, useEffect } from 'react';

export default function LayoutAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const router = useRouter();
  // //const { authenticated } = useContext(UserContext);
  // const authenticated = false;

  // useEffect(() => {
  //   if (!authenticated) {
  //     router.push('/auth/login'); // Redireciona após a renderização
  //   }
  // }, [authenticated, router]); // Dependências incluídas

  // if (!authenticated) {
  //   return null; // Evita renderizar enquanto redireciona
  // }

  return <>{children}</>;
}
