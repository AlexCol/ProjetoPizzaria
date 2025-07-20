import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    const users = await this.prisma.user.findMany();
    //const users = await this.prisma.$queryRaw`SELECT * FROM "users"`;
    return users;
  }
}
