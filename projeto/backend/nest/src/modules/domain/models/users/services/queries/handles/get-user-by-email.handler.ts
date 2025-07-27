import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUsersQuery } from '../get-users.query';
import { User } from '../../../entities/user.entity';
import { GetUserByEmailQuery } from '../get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(query: GetUsersQuery) {
    const { email } = query.filters || {};
    if (!email)
      throw new Error('Email filter is required to get user by email');

    const queryBuilder = this.userRepository.createQueryBuilder('user'); //não traz os registros, apenas monta a query
    queryBuilder.andWhere('user.email = :email', { email });
    const user = await queryBuilder.getOne();

    return user;
  }
}