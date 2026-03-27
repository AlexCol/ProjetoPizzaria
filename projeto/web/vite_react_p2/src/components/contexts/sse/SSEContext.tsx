'use client';

import { fetchEventSource } from '@microsoft/fetch-event-source';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const commandList = useRef(new Map<string, CommandsCallbacks>()).current;

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos do contexto
  //?????????????????????????????????????????????????????????????????????????????????
  function registerCommand(eventName: string, onMessage: (data: any) => void, onError?: () => void) {
    unregisterCommand(eventName); //? garante que nao tenha comando duplicado, se tiver, remove o antigo antes de adicionar o novo

    commandList.set(eventName, {
      onMessage,
      onError: onError ?? (() => undefined),
    });
  }

  function unregisterCommand(eventName: string) {
    commandList.delete(eventName);
  }

  const setSseEnabled = useCallback((enabled: boolean) => {
    setSseEnabledState(enabled);
    if (!enabled) {
      isConnectingRef.current = false;
      isConnectedRef.current = false;
      setIsConnected(false);
    }
  }, []);

  //?????????????????????????????????????????????????????????????????????????????????
  //? internal methods
  //?????????????????????????????????????????????????????????????????????????????????
  //! metodo para lidar com eventos SSE
  const handleEvent = useCallback(
    (eventName: string, rawData: string) => {
      const callback = commandList.get(eventName);
      if (!callback?.onMessage) return;

      let data: unknown = rawData;

      try {
        data = rawData ? JSON.parse(rawData) : undefined;
      } catch {
        data = rawData || undefined;
      }

      try {
        callback.onMessage(data);
      } catch (error) {
        Logger.error(`Erro ao processar evento SSE "${eventName}":`, error);
        callback.onError?.();
      }
    },
    [commandList],
  );

  //! metodo de conexao com fetch-event-source (permite enviar headers)
  const connect = useCallback(async () => {
    if (!sseEnabled || isConnectedRef.current || isConnectingRef.current) return;

    const baseUrl = import.meta.env.VITE_API_URL || '';
    if (!baseUrl) {
      toast.error('VITE_API_URL nao esta definido. SSE nao pode se conectar.');
      return;
    }

    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${normalizedBaseUrl}/api/sse/connect`;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isConnectingRef.current = true;

    try {
      await fetchEventSource(url, {
        method: 'GET',
        signal: controller.signal,
        credentials: 'include',
        openWhenHidden: true,
        headers: {
          Accept: 'text/event-stream',
          'app-origin': 'web',
        },

        async onopen(response) {
          if (!response.ok) {
            throw new Error(`Falha ao abrir SSE: ${response.status}`);
          }

          if (abortControllerRef.current !== controller) return;

          isConnectingRef.current = false;
          isConnectedRef.current = true;
          setIsConnected(true);
          Logger.log('SSE conectado com sucesso');
        },

        async onmessage(event) {
          //console.log('Evento SSE recebido:', event);
          if (abortControllerRef.current !== controller) return;

          const eventName = event.event || 'message';
          handleEvent(eventName, event.data);
        },

        onclose() {
          if (abortControllerRef.current !== controller) return;

          isConnectingRef.current = false;
          isConnectedRef.current = false;
          setIsConnected(false);
          Logger.log('SSE conexao encerrada');
        },

        onerror(error) {
          if (abortControllerRef.current !== controller) return;

          isConnectingRef.current = false;
          isConnectedRef.current = false;
          setIsConnected(false);
          Logger.error('Erro na conexao SSE:', error);
        },
      });
    } catch (error) {
      isConnectingRef.current = false;
      isConnectedRef.current = false;
      setIsConnected(false);

      if ((error as Error).name !== 'AbortError') {
        Logger.error('Erro ao criar conexao SSE:', error);
      }
    } finally {
      if (abortControllerRef.current === controller && !isConnectedRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, [handleEvent, sseEnabled]);

  //! metodo de desconexao
  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isConnectingRef.current = false;
    isConnectedRef.current = false;
    setIsConnected(false);
    Logger.log('SSE desconectado');
  }, []);

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (sseEnabled) {
      void connect();
    } else {
      disconnect();
    }

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
3. quando sseEnabled = true, connect() abre a conexao com fetchEventSource
4. no onmessage, o provider identifica o nome do evento recebido (event.event ou "message")
5. handleEvent busca no commandList o callback correspondente ao eventName
6. o payload tenta ser convertido de JSON; se nao for JSON valido, segue como texto bruto
7. executa onMessage; se o processamento do callback falhar, chama onError (se houver)
8. quando sseEnabled = false ou o provider desmonta, disconnect() aborta a conexao atual
*/
//#endregion
