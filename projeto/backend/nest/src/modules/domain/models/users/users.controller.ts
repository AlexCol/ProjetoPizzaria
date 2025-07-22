import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IsPublic } from 'src/common/decorators/isPublic';
import { TokenPayloadParam } from 'src/modules/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/modules/auth/dto/token-payload.dto';
import { NeedsPermission } from 'src/common/decorators/needsPermission';
import { Permission } from 'src/common/enums/permissao.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @IsPublic()
  @NeedsPermission(Permission.ADMIN)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @IsPublic()
  @Post()
  async create(@Body() data: CreateUserDto) {
    console.log('Creating a new user');
    return await this.usersService.create(data);
  }
}
