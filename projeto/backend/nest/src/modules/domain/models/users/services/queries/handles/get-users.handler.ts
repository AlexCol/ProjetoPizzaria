// queries/handlers/get-users.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { GetUserFilters, GetUsersQuery } from '../get-users.query';
import { User } from '../../../entities/user.entity';
import { UserResponseDto } from '../../../dto/response-user.dto';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(query: GetUsersQuery) {
    const { filters, pagination, sort } = query;
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