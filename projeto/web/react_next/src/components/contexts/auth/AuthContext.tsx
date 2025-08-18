import { authClearMessage, login, logout } from "@/redux/slices/authSlice";
import { me, userClearMessage, userReset } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
function useAuthProvider() {
  const dispatch = useDispatch<AppDispatch>();
  const { authResponse, status: authStatus, message: authMessage } = useSelector((state: RootState) => state.auth);
  const { meResponse, status: userStatus, message: meMessage } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true); //!observação no fim do código

  function signIn(data: { email: string, password: string }) {
    dispatch(login(data));
  }

  function signOut() {
    dispatch(logout());
    dispatch(userReset());
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => { //tenta buscar 'me', se cookies ainda forem validos, já vai 'autenticar'
    dispatch(me());
  }, []);

  useEffect(() => { //após authStatus processar com sucesso, busca o 'me' pra finalizar 'autenticação'
    if (authStatus === 'succeeded')
      dispatch(me());
  }, [authStatus]);

  useEffect(() => { // após authStatus processar com falha, limpa a mensagem
    if (authStatus === 'failed') {
      const timer = setTimeout(() => dispatch(authClearMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [authStatus]);

  useEffect(() => {
    if (userStatus === 'succeeded' || userStatus === 'failed') // após userStatus processar, define loading como false (vai liberar após o primeiro 'me' do useEffect)
      setIsLoading(false);

    if (userStatus === 'failed')
      dispatch(logout());

    if (userStatus === 'failed') { // após userStatus processar com falha, limpa a mensagem
      const timer = setTimeout(() => dispatch(userClearMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [userStatus]);

  //?????????????????????????????????????????????????????????????????????????????????
  //? Derivados do estado
  //?????????????????????????????????????????????????????????????????????????????????
  const isAuthenticated = !!meResponse;
  //const isLoading = userStatus === 'loading';// || authStatus === 'loading'; //!observação no fim do código
  const error = userStatus === 'failed' || authStatus === 'failed';
  const message =
    userStatus === 'failed' ? meMessage :
      authStatus === 'failed' ? authMessage :
        meMessage || authMessage;

  return {
    isAuthenticated,
    isLoading,
    error,
    message,
    userData: meResponse,
    origin: authResponse?.origin,
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

//! por que não usar os loadings dos slices:
//! como são dois loadings distintos, de depois processos interdependentes, ocorre de
//! ao processar o authSlice ele terminar o loading e o userSlice ainda não iniciou
//! isso faz as paginas de login e home darem o flicker pois efetivamente ele está
//! num estado intermediario e ainda não autenticado mas sem loading (pegou o jwt mas
//! ainda nao processou o 'me')