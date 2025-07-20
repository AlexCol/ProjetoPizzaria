import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalErrorFilter } from 'src/filters/globalError.filter';
import { APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from 'src/filters/httpError.filter';
import { AuthObfuscationFilter } from 'src/filters/authObfuscation.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalErrorFilter },
    { provide: APP_FILTER, useClass: AuthObfuscationFilter },
  ],
})
export class AppModule { }
