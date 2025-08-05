import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../auth/auth.module';

//"@nestjs/platform-socket.io"
//"@nestjs/websockets"

@Module({
  providers: [SocketGateway],
  imports: [AuthModule],
})
export class SocketModule { }