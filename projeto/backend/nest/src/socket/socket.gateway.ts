import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  // Após inicializar o servidor
  afterInit(server: Server) {
    console.log('Socket.IO server inicializado');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth.token;
    //console.log('Conectando cliente:', client.id, 'com token:', token);
    //console.log(client.handshake);
    try {
      console.log('handleConnection chamado:', client.id);
      // realiza validações do JWT
      //throw new Error('Token inválido'); // Simula erro de token inválido
    } catch (err) {
      console.log('Token inválido, desconectando...');
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('Cliente desconectado:', client.id);
  }

  @SubscribeMessage('generic-command')
  async handleCommand(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket
  ) {
    console.log('Received data:', data);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula processamento
    client.emit('generic-command-response', {
      success: true,
      message: 'Comando recebido',
    });

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula processamento
    return { success: true, message: 'Comando recebido', data };
  }
}