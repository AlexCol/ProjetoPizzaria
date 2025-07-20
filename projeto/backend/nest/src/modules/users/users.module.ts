import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Prisma } from 'generated/prisma';
import { PrismaModule } from '../database/prisma/prisma.module';

@Module({
  imports: [
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
