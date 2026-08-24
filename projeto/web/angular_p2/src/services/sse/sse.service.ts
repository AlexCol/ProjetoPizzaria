import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoggerService } from '../logger/logger.service';

interface CommandsCallbacks {
  onMessage: (data?: any) => void;
  onError?: () => void | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class SSEService {
  /****************************************/
  /* Properties                           */
  /****************************************/
  private readonly _logger = inject(LoggerService);
  private _isConnected = signal(false);
  private _sseEnabled = signal(false);
  private _eventSourceRef: EventSource | null = null;
  private _commandList = new Map<string, CommandsCallbacks>();
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _reconnectAttempt = 0;
  private readonly _maxReconnectDelayMs = 30_000;

  /****************************************/
  /* Construtor                           */
  /****************************************/
  constructor() {
    effect(() => {
      if (this._sseEnabled()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  /****************************************/
  /* Getters                              */
  /****************************************/
  get isConnected() {
    return this._isConnected();
  }

  set setEnableSSE(value: boolean) {
    // if (value === this._sseEnabled()) {
    //   return;
    // }
    // não precisa testar se o valor é diferente, pois o signal já faz isso internamente.
    this._sseEnabled.set(value);
  }
  /****************************************/
  /* Metodos publicos                     */
  /****************************************/
  registerCommand(command: string, callbacks: CommandsCallbacks) {
    this._logger.log(`Registering command: ${command}`);
    if (this._commandList.has(command)) {
      this._logger.error(`Command ${command} is already registered, overriding.`);
      this.unregisterCommand(command);
    }
    this._commandList.set(command, callbacks);

    if (this._eventSourceRef) {
      this._eventSourceRef.addEventListener(command, this.handleEvent);
    }
    this._logger.log(`Command ${command} registered successfully.`);
  }

  unregisterCommand(command: string) {
    this._logger.log(`Unregistering command: ${command}`);

    if (this._eventSourceRef) {
      this._eventSourceRef.removeEventListener(command, this.handleEvent);
    }

    this._commandList.delete(command);
  }

  /****************************************/
  /* Metodos privados                     */
  /****************************************/
  //! Arrow function preserva o `this` do serviço e mantém uma referência estável,
  //! permitindo usar o mesmo handler no addEventListener e removeEventListener.
  private readonly handleEvent = (messageEvent: MessageEvent) => {
    const callbacks = this._commandList.get(messageEvent.type);

    if (!callbacks?.onMessage) {
      this._logger.warn(`No callbacks registered for event type: ${messageEvent.type}`);
      return;
    }

    try {
      const data = JSON.parse(messageEvent.data);
      callbacks.onMessage(data);
    } catch (error) {
      this._logger.error(`Error handling event ${messageEvent.type}: ${error}`);

      callbacks.onError?.();
    }
  };

  private connect() {
    if (this._eventSourceRef) {
      this._logger.warn('Already connected to SSE.');
      return;
    }

    this.clearReconnectTimer();

    try {
      const baseUrl = environment.apiBaseUrl;
      this._eventSourceRef = new EventSource(`${baseUrl}/sse/connect`, {
        withCredentials: true,
      });

      this.cadastraOnOpenEvent(this._eventSourceRef);
      this.cadastraComandos(this._eventSourceRef);
      this.cadastraOnError(this._eventSourceRef);
    } catch (error) {
      this._eventSourceRef = null;
      this._isConnected.set(false);
      this._logger.error(`Erro ao criar conexão SSE: ${error}`);
      this.scheduleReconnect();
    }
  }

  private cadastraOnOpenEvent(eventSource: EventSource) {
    eventSource.onopen = () => {
      if (eventSource !== this._eventSourceRef) return;

      this._reconnectAttempt = 0;
      this._isConnected.set(true);
      this._logger.log('✅ SSE conectado com sucesso.');
    };
  }

  private cadastraComandos(eventSource: EventSource) {
    for (const eventName of this._commandList.keys()) {
      eventSource.addEventListener(eventName, this.handleEvent);
    }
  }

  private cadastraOnError(eventSource: EventSource) {
    eventSource.onerror = (error) => {
      if (eventSource !== this._eventSourceRef) return;

      this._isConnected.set(false);
      this._logger.error(`❌ Erro na conexão SSE. Tentando reconectar...`, error);

      // Some proxies can leave EventSource unable to recover after a deploy.
      // Recreate it explicitly instead of relying only on the browser retry.
      eventSource.close();
      this._eventSourceRef = null;
      this.scheduleReconnect();
    };
  }

  private disconnect() {
    this.clearReconnectTimer();
    this._reconnectAttempt = 0;

    if (this._eventSourceRef) {
      this._eventSourceRef.close();
      this._eventSourceRef = null;
      this._isConnected.set(false);
      this._logger.log('🚪 SSE desconectado.');
    }
  }

  private scheduleReconnect() {
    if (!this._sseEnabled() || this._reconnectTimer) return;

    const delayMs = Math.min(1_000 * 2 ** this._reconnectAttempt, this._maxReconnectDelayMs);
    this._reconnectAttempt++;

    this._logger.log(`Nova tentativa de conexão SSE em ${delayMs / 1_000}s.`);
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this._sseEnabled()) this.connect();
    }, delayMs);
  }

  private clearReconnectTimer() {
    if (!this._reconnectTimer) return;

    clearTimeout(this._reconnectTimer);
    this._reconnectTimer = null;
  }
}
