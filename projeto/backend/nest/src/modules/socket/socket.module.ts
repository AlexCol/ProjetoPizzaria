import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

//"@nestjs/platform-socket.io"
//"@nestjs/websockets"

@Global()
@Module({
  imports: [AuthModule],
  providers: [SocketService, SocketGateway],
  exports: [SocketService]
})
export class SocketModule { }