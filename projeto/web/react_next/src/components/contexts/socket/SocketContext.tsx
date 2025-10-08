import LoggedUser from "@/models/LoggedUser";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../auth/AuthContext";
import ISocket from "./Interface/ISocket";
import { SocketIOClient } from "./Sockets/SocketIO/SocketIO";

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
function useSocketProvider() {
  const [socket, setSocket] = useState<ISocket | null>(null);
  const [updateOrderList, setUpdateOrderList] = useState<boolean>(false);
  const { isAuthenticated, userData } = useAuthContext(); //precisa estar dentro do authContext

  //?????????????????????????????????????????????????????????????????????????????????
  //? internal methods
  //?????????????????????????????????????????????????????????????????????????????????  
  function StartIOSOcket(userData: LoggedUser) {
    const newSocket = new SocketIOClient(process.env.NEXT_PUBLIC_SOCKET || '', userData)
    addCommands(newSocket);
    setSocket(newSocket);
  }

  function addCommands(socket: ISocket) {
    socket.on('list_update', (args) => {
      setUpdateOrderList(prev => !prev); //! observação abaixo
    });

    socket.on('disconnect', (reason) => {
      console.log("❌ desconectado:", reason);
    });
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (!userData) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (isAuthenticated) {
      const origem = userData.origin;

      if (origem === 'njs')
        StartIOSOcket(userData);
    }
  }, [isAuthenticated]);

  return {
    updateOrderList
  }
}
export type SocketContextType = ReturnType<typeof useSocketProvider>;

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
//! mantem privado pra forçar o uso de useSocketContext
const SocketContext = createContext<SocketContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as 
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocketProvider();
  return (
    <SocketContext.Provider value={socket} >
      {children}
    </SocketContext.Provider>
  );
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext([name]Context) diretamente. Mas sim 'use' abaixo
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within an SocketProvider");
  }
  return context;
}

//Apenas tenho uma 'flag' para informar que há novas Orders, e se a tela de Pedidos estiver abertas, ela vai se buscar os pedidos.
//Mas caso o front end não conhecesse o back, e a comunicação fosse exclusivamente via socket, precisaria ter um controle maior aqui
//  no contexto. Com comandos para pedir a lista atualizada e ter a lista aqui para a tela de Pedidos mostrar (a lista não fica no
// usePedido mas sim aqui)