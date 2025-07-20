
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    //await this.$connect(); //The onModuleInit is optional — if you leave it out, Prisma will connect lazily on its first call to the database.
  }
}
//https://www.youtube.com/watch?v=S5S_8nuoSbA&list=PLR8JXremim5AdjhggWtqzgSXPYZ_V9x2b&index=4&ab_channel=ThiagoVeigah