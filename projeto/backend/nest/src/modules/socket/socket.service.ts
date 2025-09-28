import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) { }

  async notifyUser(userId: string, event: string, data?: any) {
    return this.gateway.notifyUser(userId, event, data);
  }

  async notifyRole(role: string, event: string, data?: any) {
    return this.gateway.notifyRole(role, event, data);
  }
}