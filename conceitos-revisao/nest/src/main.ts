import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //elimina do json de entrada valores que não estão no DTO
    forbidNonWhitelisted: true, //emite erro se houver valores não permitidos
    transform: true, //como 'true' tenta transformar os tipos das variáveis de entrada para os tipos definidos no tipo do metodo
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
