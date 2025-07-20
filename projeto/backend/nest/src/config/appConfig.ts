import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as express from '@nestjs/platform-express';

export class AppConfig {
  public static configure(app: INestApplication<any>): void {
    this.setPipes(app);
    this.setCors(app);
  }

  private static setPipes(app: INestApplication<any>): void {
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, //elimina do json de entrada valores que não estão no DTO
      forbidNonWhitelisted: true, //emite erro se houver valores não permitidos
      transform: true, //como 'true' tenta transformar os tipos das variáveis de entrada para os tipos definidos no tipo do metodo
    }));
  }

  private static setCors(app: INestApplication<any>): void {
    app.enableCors({
      origin: '*', //pode ser uma lista de domínios ou '*' para permitir todos
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept',
      credentials: true,
    });
  }
}