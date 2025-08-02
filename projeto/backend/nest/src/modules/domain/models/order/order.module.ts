import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { OrderItem } from './entities/order-item.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]), // Importa o módulo TypeOrm com a entidade Order
    UsersModule,
    forwardRef(() => ProductModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService], // Exporta o OrderService para ser usado em outros módulos
})
export class OrderModule { }
