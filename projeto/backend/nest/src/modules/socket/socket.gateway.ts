import { OnModuleInit } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log('Cliente conectado:', socket.id);
      // Aqui você pode adicionar lógica adicional quando um cliente se conecta

      socket.on('ping2', (data: any, callback) => { //ping2 usando padrão normal do socket.io 
        //this.server.emit('pong', { message: 'Pong!', data }); // Envia a resposta para todos os clientes
        // client.emit('pong', { message: 'Pong!', data }); //chama o 'pongo de quem enviou o ping
        callback({ message: 'Pong!', data }); // responde ao cliente via callback
      });
    });
  }

  // Após inicializar o servidor
  afterInit(server: Server) {
    //console.log('Socket.IO server inicializado');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const authToken = client.handshake.auth.token; //POSSIBILIDADES DE VIR O TOKEN NO HEADER OU NA TAG PROPRIA AUTH
    const headerToken = client.handshake.headers.token;
    console.log('Token de autenticação:', authToken);
    console.log('Token do header:', headerToken);

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

  @SubscribeMessage('ping') //ping usando o padrão do nestjs
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    //this.server.emit('pong', { message: 'Pong!', data }); // Envia a resposta para todos os clientes
    // client.emit('pong', { message: 'Pong!', data }); //chama o 'pongo de quem enviou o ping
    return { message: 'Pong!', data }; // responde o callback do cliente
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