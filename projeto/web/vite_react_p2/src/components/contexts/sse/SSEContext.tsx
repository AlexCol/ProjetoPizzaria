'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Logger from '@/utils/Logger';

//*************************************************************
//* Tipagens para o contexto
//*************************************************************
interface CommandsCallbacks {
  onMessage: (data?: any) => void;
  onError: () => void | undefined;
}

function useSseProvider() {
  const [isConnected, setIsConnected] = useState(false);
  const [sseEnabled, setSseEnabledState] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandList = useRef(new Map<string, CommandsCallbacks>()).current;

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos do contexto
  //?????????????????????????????????????????????????????????????????????????????????
  function registerCommand(eventName: string, onMessage: (data: any) => void, onError?: () => void) {
    unregisterCommand(eventName); //? garante que nao tenha comando duplicado, se tiver, remove o antigo antes de adicionar o novo

    commandList.set(eventName, { onMessage, onError: onError ?? (() => undefined) });
    if (eventSourceRef.current) {
      eventSourceRef.current.addEventListener(eventName, handleEvent);
    }
  }

  function unregisterCommand(eventName: string) {
    commandList.delete(eventName);
    if (eventSourceRef.current) {
      eventSourceRef.current.removeEventListener(eventName, handleEvent);
    }
  }

  const setSseEnabled = useCallback((enabled: boolean) => {
    setSseEnabledState(enabled);
    if (!enabled) {
      isConnectedRef.current = false;
      setIsConnected(false);
    }
  }, []);

  //?????????????????????????????????????????????????????????????????????????????????
  //? internal methods
  //?????????????????????????????????????????????????????????????????????????????????
  //! metodo para lidar com eventos SSE
  const handleEvent = useCallback(
    (event: MessageEvent) => {
      const callback = commandList.get(event.type);
      if (callback && callback.onMessage) {
        try {
          const data = JSON.parse(event.data);
          callback.onMessage(data);
        } catch {
          callback.onError?.();
        }
      }
    },
    [commandList],
  );

  //! metodos para cadastrar os eventos do EventSource (onopen, onerror e os comandos)
  const cadastraOnOpen = useCallback((eventSource: EventSource) => {
    eventSource.onopen = () => {
      isConnectedRef.current = true;
      setIsConnected(true);
      Logger.log('SSE conectado com sucesso');
    };
  }, []);

  //*
  const cadastraComandos = useCallback(
    (eventSource: EventSource) => {
      for (const eventName of commandList.keys()) {
        eventSource.addEventListener(eventName, handleEvent);
      }
    },
    [commandList, handleEvent],
  );

  //*
  const cadastraOnError = useCallback((eventSource: EventSource) => {
    eventSource.onerror = (error) => {
      isConnectedRef.current = false;
      setIsConnected(false);
      Logger.error('Erro na conexao SSE:', error);
    };
  }, []);

  //! metodo de conexao, sera automatica assim que receber authenticated = true
  const connect = useCallback(() => {
    if (!sseEnabled || isConnectedRef.current) return;

    const baseUrl = import.meta.env.VITE_API_URL || '';
    if (!baseUrl) {
      toast.error('VITE_API_URL não está definido. SSE não pode se conectar.');
      return;
    }

    const url = `${baseUrl}sse/connect`;
    try {
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      cadastraOnOpen(eventSource);
      cadastraComandos(eventSource);
      cadastraOnError(eventSource);

      eventSourceRef.current = eventSource;
    } catch (error) {
      Logger.error('Erro ao criar conexao SSE:', error);
      isConnectedRef.current = false;
    }
  }, [cadastraComandos, cadastraOnError, cadastraOnOpen, sseEnabled]);

  //! metodo de desconexao
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
      Logger.log('SSE desconectado');
    }
  }, []);

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (sseEnabled) connect();
    else disconnect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, sseEnabled]);

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
const SseContext = createContext<SseContextType | undefined>(undefined);

//*************************************************************
//* Componente Provider do contexto (onde sao iniciadas as
//* variaveis de estado e as funcoes que serao passadas no value)
//* E entao passadas no value para serem usadas pelos componentes filhos
//*************************************************************
export function SseProvider({ children }: { children: React.ReactNode }) {
  const sse = useSseProvider();
  return <SseContext.Provider value={sse}>{children}</SseContext.Provider>;
}

//*************************************************************
//* Wrappers para o contexto, de modo que nao precise ser chamado
//* useContext([name]Context) diretamente. Mas sim 'use' abaixo
//* que ja faz a verificacao de undefined e retorna o contexto
//*************************************************************
export function useSseContext() {
  const context = useContext(SseContext);
  if (context === undefined) {
    throw new Error('useSseContext must be used within an SseProvider');
  }
  return context;
}

//#region Fluxo
/*
Fluxo:

1. consumidor chama registerCommand(<eventName>, onMessage, onError?)
2. isso salva no commandList
3. cadastraComandos registra no EventSource cada eventName com o listener genérico handleEvent
4. quando chega evento, o browser chama handleEvent
5. handleEvent usa event.type para buscar no commandList o callback real
6. executa onMessage; se falhar parse/processamento, chama onError (se houver)
*/
//#endregion
