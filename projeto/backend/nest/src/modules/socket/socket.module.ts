import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { DomainModule } from '../domain/domain.module';

//"@nestjs/platform-socket.io"
//"@nestjs/websockets"

@Module({
  providers: [SocketGateway],
  imports: [DomainModule],
})
export class SocketModule { }