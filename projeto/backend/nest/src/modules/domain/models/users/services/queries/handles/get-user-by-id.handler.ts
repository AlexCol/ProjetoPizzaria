import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersQuery } from '../get-users.query';
import { User } from '../../../entities/user.entity';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../../dto/response-user.dto';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto | null> {
    const { id } = query.filters || {};
    if (!id)
      throw new Error('ID filter is required to get user by ID');

    const queryBuilder = this.userRepository.createQueryBuilder('user'); //não traz os registros, apenas monta a query
    queryBuilder.andWhere('user.id = :id', { id });
    const user = await queryBuilder.getOne();

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transformando o usuário em UserResponseDto
  }
}