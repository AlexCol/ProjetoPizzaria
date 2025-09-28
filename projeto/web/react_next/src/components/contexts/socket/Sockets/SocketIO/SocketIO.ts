import LoggedUser from "@/models/LoggedUser";
import { io, Socket } from "socket.io-client";
import ISocket from "../../Interface/ISocket";

export class SocketIOClient implements ISocket {
  private socket: Socket;

  constructor(private url: string, user: LoggedUser) {
    this.socket = io(this.url, {
      withCredentials: true, //para enviar o cookie httpclient
      extraHeaders: {
        role: 'cozinha',
        user_id: user.id.toString(),
      },
    });
  }

  async connect() {
    // socket.io conecta automaticamente
  }

  disconnect() {
    this.socket.disconnect();
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket.off(event, callback);
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }
}
