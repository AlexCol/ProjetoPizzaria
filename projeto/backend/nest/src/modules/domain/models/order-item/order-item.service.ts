import { Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly productService: ProductService,
    private readonly orderService: OrderService,
  ) { }

  async create(createOrderItemDto: CreateOrderItemDto) {
    const product = await this.productService.findOne(createOrderItemDto.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const order = await this.orderService.findOne(createOrderItemDto.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const orderItem = this.orderItemRepository.create({
      ...createOrderItemDto,
      product,
      order,
    });

    return this.orderItemRepository.save(orderItem);
  }

  async findAll() {
    return this.orderItemRepository.find();
  }

  async findOne(id: number) {
    return this.orderItemRepository.findOne({ where: { id }, relations: ['product', 'order'] });
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    await this.orderItemRepository.update(id, updateOrderItemDto);
    return this.orderItemRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.orderItemRepository.delete(id);
    return this.orderItemRepository.findOne({ where: { id } });
  }
}
