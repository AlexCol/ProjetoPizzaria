import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../domain/models/users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {//implements OnModuleInit { //para usar o onModuleInit (comentado e deixado lá em baixo)
  constructor(
    private readonly userService: UsersService, // Exemplo de injeção de dependência
  ) { }

  @WebSocketServer()
  server: Server;

  // Após inicializar o servidor
  afterInit(server: Server) {
    //console.log('Socket.IO server inicializado');
    this.server.on('connection', (client: Socket) => {
      console.log('Cliente conectado:', client.id);
      // Aqui você pode adicionar lógica adicional quando um cliente se conecta

      client.on('ping2', async (data: any, callback) => { //ping2 usando padrão normal do socket.io
        const users = await this.userService.findUsers(); // Exemplo de uso do serviço UsersService
        const sendTo = data?.respond_to;
        //console.log(client);
        //this.server.emit('pong', { message: 'Pong!', data, users }); // Envia a resposta para todos os clientes
        //client.emit('pong', { message: 'Pong!', data, users }); //chama o 'pong' de quem enviou o ping
        //callback({ message: 'Pong!', data, users }); // responde ao cliente via callback

        client.emit(sendTo, { message: 'Pong!', data, users }); //chama o 'pong' de quem enviou o ping
      });
    });
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

  @SubscribeMessage('get-users') //ping usando o padrão do nestjs
  async handleGetUsers(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    //console.log(client);
    const users = await this.userService.findUsers(); // Exemplo de uso do serviço UsersService
    //this.server.emit('pong', { message: 'Pong!', data }); // Envia a resposta para todos os clientes
    // client.emit('pong', { message: 'Pong!', data }); //chama o 'pongo de quem enviou o ping
    return { message: 'Pong!', data }; // responde o callback do cliente
  }
}

/*
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
*/

/*

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
*/