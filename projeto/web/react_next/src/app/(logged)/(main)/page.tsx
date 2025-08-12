//'use client';

import { useAuthContext } from "@/components/contexts/auth/AuthContext";

export async function Home() {
  //const { signOut } = useAuthContext();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <>
      <h1>Hello World</h1>
      <h1>Hello World</h1>
      {/* <button onClick={signOut}>Sair</button> */}
    </>
  );
}
export default Home;