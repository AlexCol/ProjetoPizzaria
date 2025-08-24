import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsPublic } from 'src/common/decorators/isPublic';
import { NeedsPermission } from 'src/common/decorators/needsPermission';
import { Permission } from 'src/common/enums/permissao.enum';
import { TokenPayloadDto } from 'src/modules/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/modules/auth/params/token-payload.param';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    // private readonly commandBus: CommandBus,
    // private readonly queryBus: QueryBus,
    private readonly userService: UsersService,
  ) { }

  @Get()
  async findAll(
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    //const usersQuery = new GetUsersQuery({}, baseQuery?.pagination, baseQuery?.sort);
    //return this.queryBus.execute(usersQuery);
    return await this.userService.findUsers(baseQuery);
  }

  @Get('me')
  async findMe(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto
  ) {
    // const usersQuery = new GetUsersQuery({ id: tokenPayload.id });
    // return await this.queryBus.execute(usersQuery);
    const user = await this.userService.findOne(tokenPayload.id);
    return { ...user, origin: 'njs' };
  }

  @IsPublic()
  @Post()
  async create(@Body() data: CreateUserDto) {
    //return await this.commandBus.execute(new CreateUserCommand(data));
    return await this.userService.create(data);
  }

  @Post("admin")
  @NeedsPermission(Permission.ADMIN)
  async createAdmin(@Body() data: CreateUserDto) {
    //return await this.commandBus.execute(new CreateUserCommand(data, true));
    return await this.userService.create(data, true);
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

    //await this.commandBus.execute(new UpdateUserCommand(id, data));
    await this.userService.update(id, data);
    return { message: 'User updated successfully' };
  }
}
