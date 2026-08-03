import { effect, inject, Injectable, signal } from '@angular/core';
import { LoggerService } from '../logger/logger.service';
import { environment } from '../../environments/environment.development';

interface CommandsCallbacks {
  onMessage: (data?: any) => void;
  onError: () => void | undefined;
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
  private readonly _eventHandler = (event: Event) => {
    this.handleEvent(event as MessageEvent);
  };

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
      this._eventSourceRef.addEventListener(command, this._eventHandler);
    }
    this._logger.log(`Command ${command} registered successfully.`);
  }

  unregisterCommand(command: string) {
    this._logger.log(`Unregistering command: ${command}`);

    if (this._eventSourceRef) {
      this._eventSourceRef.removeEventListener(command, this._eventHandler);
    }

    this._commandList.delete(command);
  }

  /****************************************/
  /* Metodos privados                     */
  /****************************************/
  private handleEvent(event: MessageEvent) {
    const callbacks = this._commandList.get(event.type);
    if (callbacks && callbacks.onMessage) {
      try {
        const data = JSON.parse(event.data);
        callbacks.onMessage(data);
      } catch (error) {
        this._logger.error(`Error handling event ${event.type}: ${error}`);
        if (callbacks.onError) {
          callbacks.onError();
        }
      }
    } else {
      this._logger.warn(`No callbacks registered for event type: ${event.type}`);
    }
  }

  private connect() {
    if (this._eventSourceRef) {
      this._logger.warn('Already connected to SSE.');
      return;
    }
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
    }
  }

  private cadastraOnOpenEvent(eventSource: EventSource) {
    eventSource.onopen = () => {
      this._isConnected.set(true);
      this._logger.log('✅ SSE conectado com sucesso.');
    };
  }

  private cadastraComandos(eventSource: EventSource) {
    for (const eventName of this._commandList.keys()) {
      eventSource.addEventListener(eventName, this._eventHandler);
    }
  }

  private cadastraOnError(eventSource: EventSource) {
    eventSource.onerror = (error) => {
      this._isConnected.set(false);
      this._logger.error(`❌ Erro na conexão SSE: ${error}`);
    };
  }

  private disconnect() {
    if (this._eventSourceRef) {
      this._eventSourceRef.close();
      this._eventSourceRef = null;
      this._isConnected.set(false);
      this._logger.log('🚪 SSE desconectado.');
    }
  }
}
