import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { Session } from '@/src/models/Session';
import { getTokenFromApi, setAuthFailHandler, setTokenOnApi } from '@/src/services/api';
import { getMe, login, logout } from '@/src/services/auth';
import { SESSION_KEY } from '@/src/shared/contants';
import { Logger } from '@/src/shared/logger';
import { getValueFromStorage, removeValueFromStorage, saveValueOnStorage } from '@/src/shared/storage';
import { useSseContext } from '../sse/SSEContext';

/************************************************/
/* Tipagens para o contexto                     */
/************************************************/
//#region Tipagens para o contexto
export type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
//#endregion

/************************************************/
/* Criando o contexto, com base no tipo acima   */
/************************************************/
//#region Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);
//#endregion

/************************************************/
/* Componente Provider do contexto (onde são iniciadas as
/* variáveis de estado e as funções que serão passadas no value)
/* E então passadas no value para serem usadas pelos componentes filhos
/************************************************/
//#region Componente Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const { registerCommand, unregisterCommand, setSseEnabled } = useSseContext();

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /************************************************/
  /* Metodos Privados                             */
  /************************************************/
  //#region Metodos Privados
  const clearAuthData = useCallback(async () => {
    setSseEnabled(false);
    setSession(null);
    setTokenOnApi('');
    await removeValueFromStorage(SESSION_KEY);
  }, [setSseEnabled]);

  const me = useCallback(async () => {
    const requestToken = getTokenFromApi();

    if (!requestToken) {
      return;
    }

    try {
      const userSession = await getMe();

      //! ignora respostas pertencentes a uma sessão anterior
      if (requestToken !== getTokenFromApi()) {
        return;
      }

      if (userSession) {
        setSession(userSession);
        setSseEnabled(true);
      } else {
        await clearAuthData();
      }
    } catch (error) {
      //! ignora erros pertencentes a uma sessão anterior
      if (requestToken !== getTokenFromApi()) {
        return;
      }

      Alert.alert('Failed to fetch user data:', String(error));
    }
  }, [clearAuthData, setSseEnabled]);
  //#endregion

  /************************************************/
  /* Metodos Publicos                             */
  /************************************************/
  //#region Metodos Publicos
  async function signIn(email: string, password: string) {
    setIsLoading(true);

    try {
      const authData = await login(email, password);

      await saveValueOnStorage(SESSION_KEY, authData.sessionToken);
      setTokenOnApi(authData.sessionToken);
      setSession(authData.userSessionPayload);
      setSseEnabled(true); //! por ultimo, pois o token precisa estar configurado antes de conectar o SSE
    } catch (error) {
      Alert.alert('Failed to sign in:', String(error));
    } finally {
      setIsLoading(false);
    }
  }

  const signOut = useCallback(async () => {
    try {
      await logout();
      await clearAuthData();
    } catch (error) {
      Alert.alert('Failed to sign out:', String(error));
    }
  }, [clearAuthData]);
  //#endregion

  /************************************************/
  /* UseEffects                                   */
  /************************************************/
  //#region UseEffects
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getValueFromStorage(SESSION_KEY);
      if (storedToken) {
        setTokenOnApi(storedToken);
        await me();
      }
      setIsLoading(false);
    };

    // carrega o token
    void loadToken();

    //adicionar o listener para chamar ao reactivar o app
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void me();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [me]);

  useEffect(() => {
    setAuthFailHandler(clearAuthData);

    return () => {
      setAuthFailHandler(null);
    };
  }, [clearAuthData]);

  useEffect(() => {
    registerCommand('session-updated', () => {
      Logger.log('Session updated received');
      void me();
    });

    return () => {
      unregisterCommand('session-updated');
    };
  }, [registerCommand, unregisterCommand, me]);

  //#endregion

  /************************************************/
  /* Provider Value                               */
  /************************************************/
  //#region Provider Value
  const providerValue: AuthContextType = {
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={providerValue}>{children}</AuthContext.Provider>;
  //#endregion
}
//#endregion

/************************************************/
/* Wrappers para o contexto, de modo que não precise ser chamado */
/* useContext(AuthContext) diretamente. Mas sim useAuthValue() */
/* que já faz a verificação de undefined e retorna o contexto */
/************************************************/
//#region Wrappers para o contexto
export function useAuthValue() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthValue must be used within an AuthProvider');
  }

  return context;
}
//#endregion
