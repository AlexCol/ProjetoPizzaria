'use client';
import { useLocalStorageListener } from "@/hooks/useLocalStorageListener";
import { createContext, useContext, useEffect, useState } from "react";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
function Auth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const localStorageKey = 'authKey';

  function signIn() {
    localStorage.setItem(localStorageKey, 'true'); // Simula o login
    setIsAuthenticated(true);
  }

  function signOut() {
    localStorage.removeItem(localStorageKey);
    setIsAuthenticated(false);
  }

  useEffect(() => {
    const localStorageValue = localStorage.getItem('authKey');
    setIsAuthenticated(localStorageValue === 'true');
    setIsLoadingAuth(false);
  }, [])

  useLocalStorageListener(localStorageKey, (newValue) => {
    if (isAuthenticated)
      signOut();
  });

  return {
    isAuthenticated,
    isLoadingAuth,
    signIn,
    signOut
  }
}
export type AuthContextType = ReturnType<typeof Auth>;

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
//! mantem privado pra forçar o uso de useAuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={Auth()}>
      {children}
    </AuthContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext([name]]Context) diretamente. Mas sim 'use' abaixo
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
