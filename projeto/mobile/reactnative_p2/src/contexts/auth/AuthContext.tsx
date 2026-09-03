import { createContext, ReactNode, useContext, useEffect } from "react";
import useAuthContextStates from "./authContext.states";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
export type AuthContextType = {
  id: string;
  name: string;
  token: string;
  isLoading: boolean;
  startupLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function AuthProvider({ children }: { children: ReactNode }) {
  const states = useAuthContextStates();
  const signIn = async (email: string, password: string) => {
    //mock, vai chamar o login

    console.log('Current token:', states.token);
    states.setToken('token');
  };
  const signOut = async () => {
    console.log('Signing out, current token:', states.token);
    states.setToken('');
  };

  useEffect(() => {

  }, []); //carrega os dados do usuário do AsyncStorage quando o componente é montado

  const providerValue: AuthContextType = {
    id: states.id,
    name: states.name,
    token: states.token,
    isLoading: states.isLoading,
    startupLoading: states.startupLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext(AuthContext) diretamente. Mas sim useAuthValue()
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useAuthValue() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthValue must be used within an AuthProvider");
  }
  return context;
}
