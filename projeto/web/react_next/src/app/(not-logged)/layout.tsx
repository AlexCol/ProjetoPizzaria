'use client';

import { useRouter } from 'next/navigation'; // Corrigido para usar o import correto
import React, { useContext, useEffect } from 'react';

export default function LayoutUnAuthOnly({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const router = useRouter();
  // //const { authenticated } = useContext(UserContext);
  // const authenticated = false;

  // useEffect(() => {
  //   if (authenticated) {
  //     router.push('/'); // Redireciona após a renderização
  //   }
  // }, [authenticated, router]); // Dependências incluídas para evitar problemas

  // if (authenticated) {
  //   return null; // Enquanto redireciona, não renderiza nada
  // }

  return <>{children}</>;
}
