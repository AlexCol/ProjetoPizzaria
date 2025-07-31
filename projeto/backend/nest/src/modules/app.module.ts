import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/common/filters/globalError.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from '../config/database/type-orm/ConfigTypeOrm';
import { DomainModule } from './domain/domain.module';
import { AuthModule } from './auth/auth.module';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { LoggerModule } from './logger/logger.module';
import { GzipInterceptor } from 'src/common/interceptors/czip.interceptor';
import { UploadFileModule } from './upload-file/upload-file.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para resolver dependências
      useClass: ConfigTypeOrm,// Usa a classe ConfigTypeOrm para fornecer as configurações
    }),
    DomainModule,
    AuthModule,
    UploadFileModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GzipInterceptor }, //ver no arquivo pq desativado
  ],
})
export class AppModule { }
