import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/common/filters/globalError.filter';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from '../config/database/type-orm/ConfigTypeOrm';
import { DomainModule } from './domain/domain.module';
import { AuthModule } from './auth/auth.module';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { LoggerModule } from './logger/logger.module';
import { GzipInterceptor } from 'src/common/interceptors/czip.interceptor';
import { UploadFileModule } from './upload-file/upload-file.module';
import { TimezoneInterceptor } from 'src/common/interceptors/timezone.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para resolver dependências
      useClass: ConfigTypeOrm,// Usa a classe ConfigTypeOrm para fornecer as configurações
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // tempo em milissegundos (60 segundos)
          limit: 10,  // número de requisições permitidas por ttl
          //blockDuration: 5000, // tempo em milissegundos (5 segundos) que o IP será bloqueado após exceder o limite, sem isso o bloqueio fica até o ttl
        },
      ],
    }),
    DomainModule,
    AuthModule,
    UploadFileModule,
    LoggerModule,
    SocketModule
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: GlobalErrorFilter },

    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GzipInterceptor }, //ver no arquivo pq desativado
    { provide: APP_INTERCEPTOR, useClass: TimezoneInterceptor }, // ✅ Adicionar aqui

    //{ provide: APP_GUARD, useClass: ThrottlerGuard }

  ],
})
export class AppModule { }