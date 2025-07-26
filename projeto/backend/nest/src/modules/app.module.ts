import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/filters/globalError.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from '../config/database/type-orm/ConfigTypeOrm';
import { DomainModule } from './domain/domain.module';
import { AuthModule } from './auth/auth.module';
import { LoggerInterceptor } from 'src/interceptors/logger.interceptor';
import { GzipInterceptor } from 'src/interceptors/czip.interceptor';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para resolver dependências
      useClass: ConfigTypeOrm,// Usa a classe ConfigTypeOrm para fornecer as configurações
    }),
    DomainModule,
    AuthModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GzipInterceptor },
  ],
})
export class AppModule { }
