'use client';

import Logger from '@/utils/Logger';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
interface commandsCallbacks {
  onMessage: (data?: any) => void;
  onError: () => void | undefined;
}

function useSseProvider() {
  const [isConnected, setIsConnected] = useState(false);
  const [sseEnabled, setSseEnabled] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const commandList = useRef(new Map<string, commandsCallbacks>()).current;

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos do contexto
  //?????????????????????????????????????????????????????????????????????????????????
  function registerCommand(eventName: string, onMessage: (data: any) => void, onError?: () => void) {
    commandList.set(eventName, { onMessage, onError: onError ?? (() => undefined) });
    if (eventSourceRef.current) {
      unregisterCommand(eventName);
      eventSourceRef.current.addEventListener(eventName, handleEvent);
    }
  }

  function unregisterCommand(eventName: string) {
    commandList.delete(eventName);
    if (eventSourceRef.current) {
      eventSourceRef.current.removeEventListener(eventName, handleEvent);
    }
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? internal methods
  //?????????????????????????????????????????????????????????????????????????????????
  //! metodo para lidar com eventos SSE
  function handleEvent(event: MessageEvent) {
    const callback = commandList.get(event.type);
    if (callback && callback.onMessage) {
      try {
        const data = JSON.parse(event.data);
        callback.onMessage(data);
      } catch {
        callback.onError?.();
      }
    }
  }

  //! metodo de conexão, será automatica assim que receber authenticated = true
  function connect() {
    if (!sseEnabled || isConnectedRef.current) return;
    const url = `${process.env.NEXT_PUBLIC_API}sse/connect`;
    try {
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      cadastraOnOpen(eventSource);
      cadastraComandos(eventSource);
      cadastraOnError(eventSource);

      eventSourceRef.current = eventSource;
      setIsConnected(true);
    } catch (error) {
      Logger.error('Erro ao criar conexão SSE:', error);
      isConnectedRef.current = false;
      setIsConnected(false);
    }
  }

  function cadastraOnOpen(eventSource: EventSource) {
    eventSource.onopen = () => {
      isConnectedRef.current = true;
      setIsConnected(true);
      Logger.log('✅ SSE conectado com sucesso');
    };
  }

  function cadastraComandos(eventSource: EventSource) {
    for (const eventName of commandList.keys()) {
      eventSource.addEventListener(eventName, handleEvent);
    }
  }

  function cadastraOnError(eventSource: EventSource) {
    eventSource.onerror = (error) => {
      isConnectedRef.current = false;
      setIsConnected(false);
      Logger.error('❌ Erro na conexão SSE:', error);
    };
  }

  //! metodo de desconexão
  function disconnect() {
    // Limpar timeout de reconexão
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Fechar conexão SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
      Logger.log('🚪 SSE desconectado');
    }

    setIsConnected(false);
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (sseEnabled) {
      connect();
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [sseEnabled]);

  return {
    registerCommand,
    unregisterCommand,
    setSseEnabled,
    isConnected,
  };
}
export type SseContextType = ReturnType<typeof useSseProvider>;

//*************************************************************
//* Criando o contexto, com base no tipo acima
//*************************************************************
//! mantem privado pra forçar o uso de useProviderContext
const SseContext = createContext<SseContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde são iniciadas as
//* variáveis de estado e as funções que serão passadas no value)
//* E então passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function SseProvider({ children }: { children: React.ReactNode }) {
  const sse = useSseProvider();
  return <SseContext.Provider value={sse}>{children}</SseContext.Provider>;
}

//*************************************************************
//* Wrappers para o contexto, de modo que não precise ser chamado
//* useContext([name]Context) diretamente. Mas sim 'use' abaixo
//* que já faz a verificação de undefined e retorna o contexto
//*************************************************************
export function useSseContext() {
  const context = useContext(SseContext);
  if (context === undefined) {
    throw new Error('useSseContext must be used within an SseProvider');
  }
  return context;
}
