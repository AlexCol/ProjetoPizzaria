'use client';

import { useAuthContext } from "@/components/contexts/auth/AuthContext";

export default function Home() {
  const { signOut, isLoadingAuth } = useAuthContext();

  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Hello World</h1>
      <h1>Hello World</h1>
      <button onClick={signOut}>Sair</button>
    </>
  );
}
