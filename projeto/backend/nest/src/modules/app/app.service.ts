import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const myEnd = process.env.POSTGRES_DB || 'default_db';
    return `Hello World! Database: ${myEnd}`;
  }
}
