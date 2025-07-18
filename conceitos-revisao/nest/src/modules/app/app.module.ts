import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { IsAdminGuard } from 'src/guards/isAdmin.guard';
import { StopWatchInterceptor } from 'src/interceptors/stopWatch.interceptor';
import { GlobalErrorFilter } from 'src/filters/globalError.filter';
import { HttpErrorFilter } from 'src/filters/httpError.filter';
import { AuthObfuscationFilter } from 'src/filters/authObfuscation.filter';
import { PessoasModule } from '../pessoas/pessoas.module';
import { GzipInterceptor } from 'src/interceptors/czip.interceptor';

@Module({
  imports: [
    PessoasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalErrorFilter }, //?ordem importa, o ultimo registrado é o primeiro a ser chamado
    { provide: APP_FILTER, useClass: HttpErrorFilter },
    { provide: APP_FILTER, useClass: AuthObfuscationFilter },

    { provide: APP_GUARD, useClass: IsAdminGuard }, //?ordem importa (guard), o primeiro registrado é o primeiro a ser chamado

    { provide: APP_INTERCEPTOR, useClass: StopWatchInterceptor }, //?ordem importa (interceptor), o primeiro registrado é o primeiro a ser chamado
    { provide: APP_INTERCEPTOR, useClass: GzipInterceptor },

  ],

})
export class AppModule { }
