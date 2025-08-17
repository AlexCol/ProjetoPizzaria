import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { AppConfig } from './config/appConfig';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { CustomNestLogger } from './modules/logger/logger.service';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: new CustomNestLogger() // Usa a instância do logger
  });

  app.setGlobalPrefix('api'); // <-- adiciona 'api' como prefixo
  await AppConfig.configure(app);

  const logger = app.get(CustomNestLogger);
  await app.listen(process.env.PIZZARIA_PORT ?? 3300);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
