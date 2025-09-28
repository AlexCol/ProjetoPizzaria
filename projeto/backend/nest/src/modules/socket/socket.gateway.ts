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
    this.logger.verbose('Tentando autenticar cliente:', client.id);
    try {
      const userData = await this.verifyToken(client);
      this.removeOldClientsWithSameToken(client); //remove clientes antigos com o mesmo token (para o caso de algum 'bug' no front que conecta mais de uma vez)
      client.handshake.headers['user_id'] = userData.id.toString();
      this.addClientRole(client);
      this.logger.verbose('Cliente autenticado com sucesso:', client.id);
    } catch (err) {
      this.logger.warn('Token inválido, desconectando... ' + err.message);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) { //disparado automaticamente quando o cliente se desconecta (precisa ser public)
    this.logger.log('Cliente desconectado:', client.id);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS PUBLICOS
  async notifyUser(userId: string, event: string, data: any) {
    for (const client of this.server.sockets.sockets.values()) {
      if (client.handshake.headers['user_id'] === userId) {
        try {
          client.emit(event, data);
        } catch (error) {
          this.logger.verbose('Erro ao enviar notificação para o usuário:', userId);
        }
        return;
      }
    }
  }

  async notifyRole(role: string, event: string, data: any) {
    this.server.to(role).emit(event, data);
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!METODOS SOCKET (CONTROLLERS)
  @SubscribeMessage('ping') //ping usando o padrão do socket.io
  async handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.verbose('Ping recebido');
    try {
      const jwt = await this.verifyToken(client); // Verifica o token do cliente
      this.logger.verbose('Token verificado com sucesso');

      if (jwt.exp - Math.floor(Date.now() / 1000) < 300) { //ver se falta menos de 5min para o token expirar
        this.logger.verbose('Token quase expirando, enviado notificação de aviso.');
        client.emit('token_expiring', { message: 'Seu token está quase expirando, solicite um novo.' });
        return;
      }

      client.emit('pong', { message: 'Pong sem usuário identificado', data });
    } catch (error) {
      this.logger.warn('Token inválido, desconectando client...');
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

  private removeOldClientsWithSameToken(client: Socket) {
    const token = client.handshake.auth.token || client.handshake.headers.token;
    for (const existingClient of this.server.sockets.sockets.values()) {
      const existingClientToken = existingClient.handshake.auth.token || existingClient.handshake.headers.token;
      if (existingClientToken === token && existingClient.id !== client.id) {
        this.logger.warn(`Cliente duplicado encontrado: ${existingClient.id}`);
        existingClient.disconnect();
      }
    }
  }

  private addClientRole(client: Socket) {
    const role = client.handshake.headers.role;

    if (role !== 'cozinha' && role !== 'garcom' && role !== 'admin') {
      this.logger.warn(`Role inválida para o cliente ${client.id}, desconectando...`);
      client.disconnect();
      return;
    }

    if (role) {
      client.join(role); // adiciona o socket à sala
      this.logger.verbose(`Cliente ${client.id} entrou na sala: ${role}`);
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