import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { CustomNestLogger } from '../logger/logger.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: CustomNestLogger,
  ) { }

  @WebSocketServer()
  server: Server;

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS CHAMADOS PELO SOCKET.IO
  afterInit(server: Server) { //disparado automaticamente quando o servidor é inicializado
    //console.log('Socket.IO server inicializado');
    this.server.on('connection', (client: Socket) => {
      this.logger.log(`Cliente conectado: ${client.id}`);
      // Aqui você pode adicionar lógica adicional quando um cliente se conecta

      //aqui tbm pode ser adicionando comandos de 'ouvir' ou 'emitir' eventos (ex ping2 lá em baixo)
    });
  }

  async handleConnection(@ConnectedSocket() client: Socket) { //disparado automaticamente quando o cliente se conecta (precisa ser public)
    this.logger.log('Tentando autenticar cliente:', client.id);
    try {
      const userData = await this.verifyToken(client);
      client.handshake.headers['user_id'] = userData.id.toString();
    } catch (err) {
      this.logger.error('Token inválido, desconectando...');
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) { //disparado automaticamente quando o cliente se desconecta (precisa ser public)
    //console.log('Cliente desconectado:', client.id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS PUBLICOS
  async notifyUser(userId: string, event: string, data: any) {
    for (const client of this.server.sockets.sockets.values()) {
      if (client.handshake.headers['user_id'] === userId) {
        try {
          client.emit(event, data);
        } catch (error) {
          this.logger.error('Erro ao enviar notificação para o usuário:', userId);
        }
        return;
      }
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS SOCKET (CONTROLLERS)
  @SubscribeMessage('ping') //ping usando o padrão do socket.io
  async handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log('Ping recebido');
    try {
      const jwt = await this.verifyToken(client); // Verifica o token do cliente
      console.log(jwt.exp);
      if (jwt.exp - Math.floor(Date.now() / 1000) < 300) { //ver se falta menos de 5min para o token expirar
        this.logger.warn('Token quase expirando, solicite novo token');
        client.emit('token_expiring', { message: 'Seu token está quase expirando, solicite um novo.' });
        return;
      }

      this.logger.log('Token verificado com sucesso');
      client.emit('pong', { message: 'Pong sem usuário identificado', data });
    } catch (error) {
      client.disconnect();
    }
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS PRIVADOS
  private async verifyToken(client: Socket): Promise<any> {
    const token = client.handshake.auth.token || client.handshake.headers.token;
    try {
      return await this.authService.verifyJwtAsync(token);
    } catch (error) {
      throw error;
    }
  }

  // @SubscribeMessage('sendMessage') //ping usando o padrão do nestjs
  // async handleSendMessage(@MessageBody() data: any) {
  //   const { userId, event, message } = data;
  //   console.log(data);
  //   await this.sendMessageToClientId(userId, event, message);
  // }

  // async sendMessageToClientId(userId: string, event: string, message: any) {
  //   // Exemplo de envio de mensagem para um cliente específico
  //   this.server.sockets.sockets.forEach((socket) => {
  //     const socketUserId = socket.handshake.headers.userid;
  //     if (socketUserId === userId) {
  //       socket.emit(event, message);
  //     }
  //   });
}

// @SubscribeMessage('get-users') //ping usando o padrão do nestjs
// async handleGetUsers(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
//   //console.log(client);
//   const users = await this.userService.findUsers(); // Exemplo de uso do serviço UsersService
//   //this.server.emit('pong', { message: 'Pong!', data }); // Envia a resposta para todos os clientes
//   // client.emit('pong', { message: 'Pong!', data }); //chama o 'pongo de quem enviou o ping
//   return { message: 'Pong!', data }; // responde o callback do cliente
// }
// }

/*
client.on('ping2', async (data: any, callback) => { //ping2 usando padrão normal do socket.io
        const users = await this.userService.findUsers(); // Exemplo de uso do serviço UsersService
        const sendTo = data?.respond_to;
        //console.log(client);
        //this.server.emit('pong', { message: 'Pong!', data, users }); // Envia a resposta para todos os clientes
        //client.emit('pong', { message: 'Pong!', data, users }); //chama o 'pong' de quem enviou o ping
        //callback({ message: 'Pong!', data, users }); // responde ao cliente via callback

        client.emit(sendTo, { message: 'Pong!', data, users }); //chama o 'pong' de quem enviou o ping
      });
*/