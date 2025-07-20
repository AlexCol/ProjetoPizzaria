import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/filters/globalError.filter';
import { APP_FILTER } from '@nestjs/core';
import { AuthObfuscationFilter } from 'src/filters/authObfuscation.filter';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    PrismaModule, // global, com isso os demais módulos podem usar o PrismaService sem precisar importar o PrismaModule
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
    { provide: APP_FILTER, useClass: AuthObfuscationFilter },
  ],
})
export class AppModule { }
