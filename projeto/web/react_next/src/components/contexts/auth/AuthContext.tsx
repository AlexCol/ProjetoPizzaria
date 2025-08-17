'use client';
import { useLocalStorageListener } from "@/hooks/useLocalStorageListener";
import { AuthResponse, login, refresh, reset } from "@/redux/slices/authSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { setTokenOnApi } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
function useAuthProvider() {
  const dispatch = useDispatch<AppDispatch>();
  const { authResponse, loading, error, success, message } = useSelector((state: RootState) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const localStorageKey = 'authKey';

  function signIn(data: { email: string, password: string }) {
    dispatch(login(data));
  }

  function signOut() {
    dispatch(reset());
    localStorage.removeItem(localStorageKey);
    setTokenOnApi('');
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    const localStorageValue = localStorage.getItem(localStorageKey);
    const authData: AuthResponse = JSON.parse(localStorageValue || '{}');
    if (authData.refreshToken)
      dispatch(refresh({ refreshToken: authData.refreshToken }));
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    console.log('authResponse', authResponse);
    if (authResponse) {
      setIsAuthenticated(true);
      localStorage.setItem(localStorageKey, JSON.stringify(authResponse));
      setTokenOnApi(authResponse.accessToken);
    } else {
      setIsAuthenticated(false);
    }
  }, [authResponse]);

  //?????????????????????????????????????????????????????????????????????????????????
  //? useLocalStorageListener
  //?????????????????????????????????????????????????????????????????????????????????
  useLocalStorageListener(localStorageKey, (newValue) => {
    if (isAuthenticated)
      signOut();
  });

  return {
    isAuthenticated,
    isLoadingAuth: !storageLoaded || loading,
    error,
    message,
    signIn,
    signOut
  }
}
export type AuthContextType = ReturnType<typeof useAuthProvider>;

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
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
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
