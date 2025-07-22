import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { FastifyRequest } from 'fastify';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) { }

  @Post()
  async create(
    @Body() createOrderItemDto: CreateOrderItemDto
  ) {
    return await this.orderItemService.create(createOrderItemDto);
  }

  @Get()
  async findAll() {
    return await this.orderItemService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.orderItemService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return await this.orderItemService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.orderItemService.remove(id);
  }
}
