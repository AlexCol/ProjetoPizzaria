import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { filter } from 'rxjs';
import { GetOrderFilters, OrderQueryParam } from './param/order-query.param';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async findAll(
    @OrderQueryParam() filters?: GetOrderFilters,
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    const query = {
      filters,
      pagination: baseQuery?.pagination,
      sort: baseQuery?.sort,
    }
    return await this.orderService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.orderService.findOne(id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number
  ) {
    return await this.orderService.remove(id);
  }
}
