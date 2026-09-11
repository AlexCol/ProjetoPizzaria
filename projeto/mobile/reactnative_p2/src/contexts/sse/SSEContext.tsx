import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import EventSource, { EventSourceListener } from 'react-native-sse';
import { getApiBaseUrl, getTokenFromApi, notifyAuthFail } from '@/src/services/api';
import { Logger } from '@/src/shared/logger';

/************************************************/
/* Tipagens para o contexto                     */
/************************************************/
//#region Tipagens para o contexto
interface CommandsCallbacks<T = unknown> {
  onMessage: (data: T) => void;
  onError: () => void;
}

export type SseEvents = 'session-updated';

export type SseContextType = {
  isConnected: boolean;
  registerCommand: <T = unknown>(eventName: SseEvents, onMessage: (data: T) => void, onError?: () => void) => void;
  unregisterCommand: (eventName: SseEvents) => void;
  setSseEnabled: (enabled: boolean) => void;
};
//#endregion

/************************************************/
/* Criando o contexto, com base no tipo acima   */
/************************************************/
//#region Criação do contexto
const SseContext = createContext<SseContextType | undefined>(undefined);
//#endregion

/************************************************/
/* Componente Provider do contexto (onde são iniciadas as
/* variáveis de estado e as funções que serão passadas no value)
/* E então passadas no value para serem usadas pelos componentes filhos
/************************************************/
//#region Componente Provider do contexto
export function SseProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [sseEnabled, setSseEnabledState] = useState(false);

  const eventSourceRef = useRef<EventSource<string> | null>(null);
  const commandListRef = useRef(new Map<SseEvents, CommandsCallbacks>());
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /************************************************/
  /* Metodos Privados                             */
  /************************************************/
  //#region Metodos Privados
  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current !== null) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  }, []);

  //! metodo para lidar com eventos SSE
  const handleEvent = useCallback<EventSourceListener<string>>((event) => {
    if (!('data' in event)) {
      return;
    }

    const callback = commandListRef.current.get(event.type as SseEvents);
    if (!callback) {
      return;
    }

    try {
      const data = event.data ? JSON.parse(event.data) : undefined;
      callback.onMessage(data);
    } catch {
      callback.onError();
    }
  }, []);

  //! cadastra evento de conexão
  const cadastraOnOpen = useCallback(
    (eventSource: EventSource<string>) => {
      eventSource.addEventListener('open', () => {
        if (eventSource !== eventSourceRef.current) return;
        clearRecoveryTimer();
        setIsConnected(true);
        Logger.log('SSE conectado com sucesso');
      });
    },
    [clearRecoveryTimer],
  );

  //! cadastra comandos registrados
  const cadastraComandos = useCallback(
    (eventSource: EventSource<string>) => {
      for (const eventName of commandListRef.current.keys()) {
        eventSource.addEventListener(eventName, handleEvent);
      }
    },
    [handleEvent],
  );

  //! fecha a conexão SSE sem alterar estados do React
  const closeConnection = useCallback(
    (log = true) => {
      clearRecoveryTimer();
      if (eventSourceRef.current) {
        eventSourceRef.current.removeAllEventListeners();
        eventSourceRef.current.close();
        eventSourceRef.current = null;

        if (log) {
          Logger.log('SSE desconectado');
        }
      }
    },
    [clearRecoveryTimer],
  );

  //! cadastra evento de erro
  const cadastraOnError = useCallback(
    (eventSource: EventSource<string>, token: string) => {
      eventSource.addEventListener('error', (error) => {
        if (eventSource !== eventSourceRef.current) {
          return;
        }

        setIsConnected(false);
        Logger.error('Erro na conexão SSE:', error);

        clearRecoveryTimer();
        const unauthorized = error.type === 'error' && error.xhrStatus === 401;

        // Aguarda o handler da biblioteca terminar antes de cancelar seus timers.
        recoveryTimerRef.current = setTimeout(
          () => {
            recoveryTimerRef.current = null;
            if (eventSource !== eventSourceRef.current || token !== getTokenFromApi()) return;

            if (unauthorized) {
              closeConnection(false);
              setSseEnabledState(false);
              notifyAuthFail();
              return;
            }

            if (AppState.currentState !== 'active') return;
            // close() cancela a reconexao automatica sem remover os listeners.
            eventSource.close();
            eventSource.open();
          },
          unauthorized ? 0 : 5000,
        );
      });
    },
    [clearRecoveryTimer, closeConnection],
  );

  //! metodo de conexão
  const connect = useCallback(() => {
    if (AppState.currentState !== 'active' || eventSourceRef.current) {
      return;
    }

    const url = `${getApiBaseUrl()}/sse/connect`;
    const token = getTokenFromApi();

    const eventSource = new EventSource<string>(url, {
      headers: {
        Authorization: token,
      },
      pollingInterval: 5000,
    });

    cadastraOnOpen(eventSource);
    cadastraComandos(eventSource);
    cadastraOnError(eventSource, token);

    eventSourceRef.current = eventSource;
  }, [cadastraOnOpen, cadastraComandos, cadastraOnError]);
  //#endregion

  /************************************************/
  /* Metodos Publicos                             */
  /************************************************/
  //#region Metodos Publicos
  const registerCommand = useCallback(
    <T,>(eventName: SseEvents, onMessage: (data: T) => void, onError?: () => void) => {
      eventSourceRef.current?.removeEventListener(eventName, handleEvent);

      commandListRef.current.set(eventName, {
        onMessage: (data) => onMessage(data as T),
        onError: onError ?? (() => undefined),
      });

      eventSourceRef.current?.addEventListener(eventName, handleEvent);
    },
    [handleEvent],
  );

  const unregisterCommand = useCallback(
    (eventName: SseEvents) => {
      commandListRef.current.delete(eventName);
      eventSourceRef.current?.removeEventListener(eventName, handleEvent);
    },
    [handleEvent],
  );

  const setSseEnabled = useCallback(
    (enabled: boolean) => {
      if (!enabled) {
        closeConnection();
        setIsConnected(false);
      }

      setSseEnabledState(enabled);
    },
    [closeConnection],
  );
  //#endregion

  /************************************************/
  /* UseEffects                                   */
  /************************************************/
  //#region UseEffects
  useEffect(() => {
    if (!sseEnabled) {
      return;
    }
    connect();
    return closeConnection;
  }, [sseEnabled, connect, closeConnection]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (!sseEnabled) {
        return;
      }

      if (state === 'active') {
        connect();
        return;
      }

      closeConnection();
      setIsConnected(false);
    });

    return () => {
      subscription.remove();
    };
  }, [sseEnabled, connect, closeConnection]);
  //#endregion

  /************************************************/
  /* Provider Value                               */
  /************************************************/
  //#region Provider Value
  const providerValue: SseContextType = {
    isConnected,
    registerCommand,
    unregisterCommand,
    setSseEnabled,
  };

  return <SseContext.Provider value={providerValue}>{children}</SseContext.Provider>;
  //#endregion
}
//#endregion

/************************************************/
/* Wrappers para o contexto, de modo que não precise ser chamado */
/* useContext(SseContext) diretamente. Mas sim useSseContext() */
/* que já faz a verificação de undefined e retorna o contexto */
/************************************************/
//#region Wrappers para o contexto
export function useSseContext() {
  const context = useContext(SseContext);

  if (context === undefined) {
    throw new Error('useSseContext must be used within an SseProvider');
  }

  return context;
}
//#endregion
