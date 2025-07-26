import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { AppConfig } from './config/appConfig';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { CustomNestLogger } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: new CustomNestLogger() // Usa a instância do logger
  });

  app.setGlobalPrefix('api'); // <-- adiciona 'api' como prefixo
  AppConfig.configure(app);

  await app.listen(process.env.PIZZARIA_PORT ?? 3300);
}
bootstrap();
