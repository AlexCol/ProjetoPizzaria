import { INestApplication, ValidationPipe } from "@nestjs/common";

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
        'Accept-Encoding'     // ✅ Para compressão
      ],

      credentials: true,        // ✅ OK agora que origin é específica

      optionsSuccessStatus: 200, // ✅ Para suporte a browsers antigos

      maxAge: 86400,           // ✅ Cache preflight por 24h
    });
  }
}