import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Importa o módulo TypeOrm com a entidade User
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta o serviço para ser utilizado em outros módulos
})
export class UsersModule { }
