import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { AppConfig } from './config/appConfig';
import { FastifyAdapter } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());

  AppConfig.configure(app);

  await app.listen(process.env.PIZZARIA_PORT ?? 3300);
}
bootstrap();
