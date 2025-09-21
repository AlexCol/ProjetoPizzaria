import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TokenPayloadDto } from 'src/modules/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/modules/auth/params/token-payload.param';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';
import { GetOrderFilters, OrderQueryParam } from './param/order-query.param';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  async findAllOrders(
    @OrderQueryParam() filters?: GetOrderFilters,
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    const query = {
      filters,
      pagination: baseQuery?.pagination,
      sort: baseQuery?.sort,
    }
    return await this.orderService.findAllOrders(query);
  }

  @Get(':id')
  async findOneOrder(@Param('id') id: number) {
    return await this.orderService.findOneOrder(id);
  }

  @Post()
  async createOrder(
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return await this.orderService.createOrder(tokenPayload.id, createOrderDto);
  }

  @Post(":orderId/item")
  async addOrderItem(
    @Param('orderId') orderId: number,
    @Body() orderItemDto: CreateOrderItemDto[]
  ) {
    return await this.orderService.addOrderItem(orderId, orderItemDto);
  }

  @Patch('item/:id/amount/:amount')
  async updateOrderItemAmount(
    @Param('id') id: number,
    @Param('amount') amount: number
  ) {
    return await this.orderService.updateOrderItemAmount(id, amount);
  }

  @Patch(':id')
  async updateOrder(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @Patch(':id/reopen')
  async reOpenOrder(
    @Param('id') id: number
  ) {
    return await this.orderService.reOpenOrder(id);
  }

  @Delete(':id')
  async removeOrder(
    @Param('id') id: number
  ) {
    return await this.orderService.removeOrder(id);
  }

  @Delete('item/:id')
  async removeOrderItem(
    @Param('id') id: number
  ) {
    return await this.orderService.removeOrderItem(id);
  }
}
