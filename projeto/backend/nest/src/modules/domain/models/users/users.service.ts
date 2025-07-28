import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { IHashingService } from 'src/modules/auth/hashing/hashing.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission } from 'src/common/enums/permissao.enum';
import { GetUserFilters } from './types/users-query';
import { BaseQueryParamType } from '../../common/params/base-query.param';
import { BaseQueryType } from '../../common/types/base-query';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: IHashingService, // Injecting the hashing service
  ) { }

  async findUsers(query?: BaseQueryType<GetUserFilters>) {
    const { filters, pagination, sort } = query || {};
    const { page = 1, limit = 10 } = pagination || {};
    const { field = 'id', order = 'ASC' } = sort || {};

    const queryBuilder = this.userRepository.createQueryBuilder('user'); //não traz os registros, apenas monta a query

    if (filters)
      this.addFilters(queryBuilder, filters);

    // ✅ Ordenação
    queryBuilder.orderBy(`user.${field}`, order);

    // ✅ Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // ✅ Execução otimizada
    const [users, total] = await queryBuilder.getManyAndCount(); //aqui executa a query e traz os registros

    return {
      users: plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true }), // Transformando os usuários em UserResponseDto
      total,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transforming the user entity to UserResponseDto
  }

  async findByEmail(email: string) { //used for login, so password can be returned
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async create(data: CreateUserDto, isAdmin: boolean = false) {
    if (!isAdmin && data.permissions.find(p => p === Permission.ADMIN))
      throw new BadRequestException('Cannot create a user with ADMIN permission directly');

    if (this.passwordDontMatch(data.password, data.confirmPassword))
      throw new BadRequestException('Passwords do not match');

    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser)
      throw new BadRequestException('Email already exists');

    data.password = await this.hashingService.hashPassword(data.password);

    const user = this.userRepository.create(data);
    await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transforming the user entity to UserResponseDto
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (this.passwordDontMatch(updateUserDto.password, updateUserDto.confirmPassword))
      throw new BadRequestException('Passwords do not match');

    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser)
      throw new BadRequestException('User not found');

    if (updateUserDto.password)
      updateUserDto.password = await this.hashingService.hashPassword(updateUserDto.password);

    this.userRepository.merge(existingUser, updateUserDto);
    await this.userRepository.save(existingUser);
  }

  private passwordDontMatch(password: string | undefined, confirmPassword: string | undefined): boolean {
    if (!password && !confirmPassword) return false;
    return password !== confirmPassword;
  }

  private addFilters(queryBuilder, filters: GetUserFilters) {
    if (filters.id)
      queryBuilder.andWhere('user.id = :id', { id: filters.id });

    if (filters.email)
      queryBuilder.andWhere('user.email = :email', { email: filters.email });

    if (filters.active !== undefined)
      queryBuilder.andWhere('user.ativo = :active', { active: filters.active });

    if (filters.permission)
      queryBuilder.andWhere(':permission = ANY(user.permissions)', { permission: filters.permission });

    if (filters.search) {
      const search = `%${filters.search}%`;
      queryBuilder.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search });
    }
  }
}