import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
  ) { }

  async findAll() {
    return "findAll orders"; //return await this.orderRepository.find();
  }

  async findOne(id: number) {
    return "find one Order"; //await this.orderRepository.findOne({ where: { id } });
  }

  async create(createOrderDto: CreateOrderDto) {
    // const user = await this.usersService.findOne(createOrderDto.userId);
    // if (!user) {
    //   throw new Error('User not found');
    // }

    // const order = this.orderRepository.create({ ...createOrderDto, user });
    // return await this.orderRepository.save(order);
    return "create order";
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return "update order"; //await this.orderRepository.update(id, updateOrderDto);
  }

  async remove(id: number) {
    return "remove order"; //await this.orderRepository.delete(id);
  }
}
