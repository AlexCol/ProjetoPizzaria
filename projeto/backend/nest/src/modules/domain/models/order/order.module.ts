import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]), // Importa o módulo TypeOrm com a entidade Order
    UsersModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService], // Exporta o OrderService para ser usado em outros módulos
})
export class OrderModule { }
