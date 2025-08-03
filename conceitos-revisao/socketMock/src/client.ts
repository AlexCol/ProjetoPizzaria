import { io, Socket } from 'socket.io-client';
import { addEvents } from './events';
import { addCommands } from './commands';
import { addResponses } from './responses';

// Altere a URL para o endereço do seu servidor NestJS
export class SocketClient {
  public socket: Socket;
  public commands: ReturnType<typeof addCommands>;
  constructor() {
    this.socket = io('http://localhost:3300', {
      transports: ['websocket'],
      auth: {
        token: 'SEU_TOKEN_JWT_AQUI'
      },
      // Configurações de reconexão
      reconnection: true,
      reconnectionAttempts: 5, // Máximo 5 tentativas
      reconnectionDelay: 1000, // 1 segundo entre tentativas
      reconnectionDelayMax: 5000, // Máximo 5 segundos de delay
      timeout: 10000, // Timeout de 10 segundos para conexão
      forceNew: false
    });

    addEvents(this.socket);
    addResponses(this.socket);
    this.commands = addCommands(this.socket);

  }
}

