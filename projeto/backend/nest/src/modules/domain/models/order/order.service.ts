import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQuery } from '../users/services/queries/get-users.query';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly queryBus: QueryBus, // ✅ Global
    private readonly commandBus: CommandBus, // ✅ Global
    //private readonly usersService: UsersService,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    //const user = await this.usersService.findOne(createOrderDto.userId);
    const user = await this.queryBus.execute(new GetUsersQuery({ id: createOrderDto.userId }));
    if (!user) {
      throw new Error('User not found');
    }

    const order = this.orderRepository.create({ ...createOrderDto, user });
    return await this.orderRepository.save(order);
  }

  async findAll() {
    return await this.orderRepository.find();
  }

  async findOne(id: number) {
    return await this.orderRepository.findOne({ where: { id } });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return await this.orderRepository.update(id, updateOrderDto);
  }

  async remove(id: number) {
    return await this.orderRepository.delete(id);
  }
}
