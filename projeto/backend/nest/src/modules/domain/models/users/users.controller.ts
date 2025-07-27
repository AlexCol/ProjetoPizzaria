import { Controller, Get, Post, Body, Patch, Param, BadRequestException, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { IsPublic } from 'src/common/decorators/isPublic';
import { TokenPayloadParam } from 'src/modules/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/modules/auth/dto/token-payload.dto';
import { NeedsPermission } from 'src/common/decorators/needsPermission';
import { Permission } from 'src/common/enums/permissao.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './services/commands/create-user.command';
import { UpdateUserCommand } from './services/commands/update-user.command';
import { GetUsersQuery } from './services/queries/get-users.query';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get()
  async findAll(
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    const usersQuery = new GetUsersQuery({}, baseQuery?.pagination, baseQuery?.sort);
    return this.queryBus.execute(usersQuery);
  }

  @Get('me')
  async findMe(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    const usersQuery = new GetUsersQuery({ id: tokenPayload.id });
    return await this.queryBus.execute(usersQuery);
  }

  @IsPublic()
  @Post()
  async create(@Body() data: CreateUserDto) {
    return await this.commandBus.execute(new CreateUserCommand(data));
  }

  @Post("admin")
  @NeedsPermission(Permission.ADMIN)
  async createAdmin(@Body() data: CreateUserDto) {
    return await this.commandBus.execute(new CreateUserCommand(data, true));
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

    await this.commandBus.execute(new UpdateUserCommand(id, data));
    return { message: 'User updated successfully' };
  }
}
