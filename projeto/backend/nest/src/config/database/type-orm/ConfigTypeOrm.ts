import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class ConfigTypeOrm implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT as any,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: Boolean(process.env.DB_AUTO_LOAD_ENTITIES), // carrega automaticamente as entidades
      synchronize: Boolean(process.env.DB_SYNCHRONIZE), // sincroniza o banco de dados com as entidades (não usar em produção)
    };
  }
}

