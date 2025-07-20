import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Make PrismaModule global if needed
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
