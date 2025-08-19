import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalErrorFilter } from 'src/common/filters/globalError.filter';
import { GzipInterceptor } from 'src/common/interceptors/czip.interceptor';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { TimezoneInterceptor } from 'src/common/interceptors/timezone.interceptor';
import { ConfigTypeOrm } from '../config/database/type-orm/ConfigTypeOrm';
import { AuthModule } from './auth/auth.module';
import { DomainModule } from './domain/domain.module';
import { LoggerModule } from './logger/logger.module';
import { SocketModule } from './socket/socket.module';
import { UploadFileModule } from './upload-file/upload-file.module';

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
          ttl: 1000, // tempo em milissegundos (1 segundo)
          limit: 10,  // número de requisições permitidas por ttl
          blockDuration: 60000, // tempo em milissegundos (60 segundos) que o IP será bloqueado após exceder o limite, sem isso o bloqueio fica até o ttl
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

    { provide: APP_GUARD, useClass: ThrottlerGuard }

  ],
})
export class AppModule { }