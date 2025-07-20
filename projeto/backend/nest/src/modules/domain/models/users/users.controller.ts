import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    console.log('Fetching all users');
    return await this.usersService.findAll();
  }

  @Post()
  async create(@Body() data: CreateUserDto) {
    console.log('Creating a new user');
    return await this.usersService.create(data);
  }
}
