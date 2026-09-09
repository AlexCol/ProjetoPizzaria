import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Session } from '@/src/models/Session';
import { setTokenOnApi } from '@/src/services/api';
import { getMe, login, logout } from '@/src/services/auth';
import { isEmail } from '@/src/shared/helpers';
import { getValueFromStorage, removeValueFromStorage, saveValueOnStorage, StorageKey } from '@/src/shared/storage';

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
export type AuthContextType = {
  user: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function AuthProvider({ children }: { children: ReactNode }) {
  const SESSION_KEY: StorageKey = 'sessionToken';
  const [user, setUser] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**********************************/
  /* Metodos Publicos               */
  /**********************************/
  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      if (!isEmail(email)) {
        throw new Error('Email inválido!');
      }

      const authData = await login(email, password);
      if (!authData) {
        return;
      }

      setUser(authData.userSessionPayload);
      await saveValueOnStorage(SESSION_KEY, authData.sessionToken);
      setTokenOnApi(authData.sessionToken);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    await logout();
    await clearAuthData();
  }

  /**********************************/
  /* Metodos Privados               */
  /**********************************/
  async function me() {
    const userSession = await getMe();
    if (userSession) {
      setUser(userSession);
    } else {
      await clearAuthData();
    }
  }

  async function clearAuthData() {
    setUser(null);
    await removeValueFromStorage(SESSION_KEY);
    setTokenOnApi('');
  }

  /**********************************/
  /* UseEffects                     */
  /**********************************/
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getValueFromStorage(SESSION_KEY);
      if (storedToken) {
        setTokenOnApi(storedToken);
        await me();
      }
      setIsLoading(false);
    };
    void loadToken();
    // Inicializa a autenticação somente quando o provider é montado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**********************************/
  /* Provider Value                 */
  /**********************************/
  const providerValue: AuthContextType = {
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={providerValue}>{children}</AuthContext.Provider>;
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext(AuthContext) diretamente. Mas sim useAuthValue()
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useAuthValue() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthValue must be used within an AuthProvider');
  }
  return context;
}
