import { Controller, Get, Post, Body, Patch, Param, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IsPublic } from 'src/common/decorators/isPublic';
import { TokenPayloadParam } from 'src/modules/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/modules/auth/dto/token-payload.dto';
import { NeedsPermission } from 'src/common/decorators/needsPermission';
import { Permission } from 'src/common/enums/permissao.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @Post("admin")
  @NeedsPermission(Permission.ADMIN)
  async createAdmin(@Body() data: CreateUserDto) {
    console.log('Creating a new admin user');
    return await this.usersService.create(data, true);
  }

  @Patch(":id")
  async update(
    @Param("id") id: number,
    @Body() data: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    const isUserAdmin = tokenPayload.permissions.includes(Permission.ADMIN);
    const updatedUserIsAdmin = data.permissions?.includes(Permission.ADMIN);

    if (updatedUserIsAdmin && !isUserAdmin)
      throw new BadRequestException('Only admins can assign ADMIN permission to users.');

    if (id !== tokenPayload.id && !isUserAdmin)
      throw new BadRequestException('You do not have permission to update this user.');

    return await this.usersService.update(id, data);
  }
}
