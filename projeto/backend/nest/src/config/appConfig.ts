import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import multipart from '@fastify/multipart';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from "@fastify/cookie";

export class AppConfig {
  public static async configure(app: NestFastifyApplication): Promise<void> {
    this.setPipes(app);
    this.registerMultipart(app);
    this.registerHelmet(app);
    this.setCors(app);
    await this.addCookies(app);
  }

  private static setPipes(app: NestFastifyApplication): void {
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, //elimina do json de entrada valores que não estão no DTO
      forbidNonWhitelisted: true, //emite erro se houver valores não permitidos
      transform: true, //como 'true' tenta transformar os tipos das variáveis de entrada para os tipos definidos no tipo do metodo
    }));
  }

  private static registerMultipart(app: NestFastifyApplication): void {
    app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite de 5MB        
      },
    });
  }

  private static registerHelmet(app: NestFastifyApplication): void {
    app.register(fastifyHelmet);
  }

  private static setCors(app: NestFastifyApplication): void {
    const isProduction = process.env.NODE_ENV === 'production';
    app.enableCors({
      origin: isProduction
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://meudominio.com']
        : ['http://localhost:3000', 'http://localhost:3001'], // ✅ Origens específicas

      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

      allowedHeaders: [
        'Content-Type',
        'Accept',
        'Authorization',      // ✅ Para JWT tokens
        'X-Requested-With',   // ✅ Para AJAX
        'Accept-Language',    // ✅ Para i18n
        'Accept-Encoding',    // ✅ Para compressão
        'remember-me',        // ✅ Para o cabeçalho personalizado
      ],

      credentials: true,        // ✅ OK agora que origin é específica

      optionsSuccessStatus: 200, // ✅ Para suporte a browsers antigos

      maxAge: 86400,           // ✅ Cache preflight por 24h
    });
  }

  private static async addCookies(app: NestFastifyApplication) {
    await app.register(fastifyCookie, { secret: '' });
  }
}