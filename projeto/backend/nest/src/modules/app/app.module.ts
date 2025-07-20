import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/filters/globalError.filter';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from '../../config/database/type-orm/ConfigTypeOrm';
import { DomainModule } from '../domain/models/domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para resolver dependências
      useClass: ConfigTypeOrm,// Usa a classe ConfigTypeOrm para fornecer as configurações
    }),
    DomainModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
  ],
})
export class AppModule { }
