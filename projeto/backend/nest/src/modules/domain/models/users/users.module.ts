import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import userCqrs from './user.cqrs';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ], // Importa o módulo TypeOrm com a entidade User
  controllers: [UsersController],
  providers: [
    UsersService,
    ...userCqrs.CommandHandlers,
    ...userCqrs.QueryHandlers,
    ...userCqrs.EventHandlers
  ],
  exports: [
    //UsersService, 
  ]
})
export class UsersModule { }

//! com a mudança para CQRS, nao é necessário exportar o UsersService,
//! pois o se tem o modulo CQRS globalmente, e com isso basta injetar
//! o command e queryBus onde se precisar, e dar um import no que precisa
//! vide: AuthModule agora usa o QueryBus para acessar os usuários