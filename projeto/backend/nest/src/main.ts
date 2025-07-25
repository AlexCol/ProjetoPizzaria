import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { AppConfig } from './config/appConfig';
import { FastifyAdapter } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'] // Configura o logger para mostrar todos os níveis
  });

  app.setGlobalPrefix('api'); // <-- adiciona 'api' como prefixo
  AppConfig.configure(app);

  await app.listen(process.env.PIZZARIA_PORT ?? 3300);
}
bootstrap();
