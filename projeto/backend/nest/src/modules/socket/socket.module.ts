import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

//"@nestjs/platform-socket.io"
//"@nestjs/websockets"

@Module({
  providers: [SocketGateway],
})
export class SocketModule { }