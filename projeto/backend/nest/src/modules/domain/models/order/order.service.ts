import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from 'src/modules/socket/socket.service';
import { FindOptionsSelect, Repository, SelectQueryBuilder } from 'typeorm';
import { BaseQueryType } from '../../common/types/base-query';
import { ProductService } from '../product/product.service';
import { UsersService } from '../users/users.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { GetOrderFilters } from './param/order-query.param';

@Injectable()
export class OrderService {
  constructor(
    //dependencias com anotações
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => ProductService)) //necessário devido a referencia circular entre ProductService e OrderService
    private readonly productService: ProductService,
    //dependencias sem anotações
    private readonly usersService: UsersService,
    private readonly socket: SocketService,
  ) { }

  //****************************************************************************
  //* METODOS PUBLICOS
  //****************************************************************************
  async findAllOrders(query?: BaseQueryType<GetOrderFilters>) {
    const { filters, pagination, sort } = query || {};
    const { page = 1, limit = 10 } = pagination || {};
    const { field = 'id', order = 'ASC' } = sort || {};

    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (filters?.fullData)
      this.addSelectAndRelations(queryBuilder);

    if (filters)
      this.addFilters(queryBuilder, filters);

    // ✅ Ordenação
    console.log(`Sorting by field: ${field}, order: ${order}`);
    queryBuilder.orderBy(`order.${field}`, order);

    // ✅ Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // ✅ Execução otimizada
    const [orders, total] = await queryBuilder.getManyAndCount();

    // const ordersResult: any[] = []; //só pra fins de retorno, não vou me preocupar com tipagem
    // for (const order of orders) {
    //   const totalPrice = order.itens.reduce((acc, item) => acc + item.product.price * item.amount, 0);
    //   ordersResult.push({
    //     totalPrice,
    //     ...order,
    //   });
    // }

    return {
      orders,//: ordersResult,
      total,
    };
  }

  async findOneOrder(id: number) {
    const order = await this.orderRepository.findOne({
      select: this.selectFields,
      where: { id },
      relations: ['user', 'itens', 'itens.product'],//, 'itens.product.category']
    });

    //if (!order)
    return order;

    // const totalPrice = order.itens.reduce((acc, item) => acc + item.product.price * item.amount, 0);
    // return {
    //   totalPrice,
    //   ...order,
    // };
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    //!poderia ignorar essa validação, pois o Id vem do JWT, mas decide por uma validação adicional (caso o metodo seja criado de outra forma - ex via socket)
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (createOrderDto.itens?.length > 0) {
      for (const ordemItem of createOrderDto.itens) {
        const product = await this.productService.findOne(ordemItem.productId);
        if (!product) {
          throw new NotFoundException(`Product not found: ${ordemItem.productId}`);
        }
      }
    }

    const order = this.orderRepository.create({ ...createOrderDto, userId, user });
    const result = await this.orderRepository.save(order);

    return result;
  }

  async addOrderItem(orderId: number, orderItemDtoList: CreateOrderItemDto[]) {
    // ✅ Validações iniciais
    const order = await this.findOneOrder(orderId);
    if (!order)
      throw new NotFoundException(`Order with id ${orderId} not found`);
    if (order.status) //true = fullfilled
      throw new BadRequestException(`Cannot add item to order with id ${orderId} because it is already fulfilled`);

    const results = await this.orderRepository.manager.transaction(async (entityManager) => {
      return this.processOrderItemsAsync(entityManager, orderId, orderItemDtoList)
    });

    return {
      message: `Order items processed successfully`,
      totalProcessed: results.length,
      details: results
    };
  }

  async updateOrderItemAmount(orderItemId: number, amount: number) {
    if (amount <= 0)
      throw new BadRequestException(`Amount must be greater than zero`);

    const orderItem = await this.orderItemRepository.findOne({ where: { id: orderItemId } });
    if (!orderItem)
      throw new NotFoundException(`Order item with id ${orderItemId} not found`);

    const order = await this.findOneOrder(orderItem.orderId);
    if (!order)
      throw new NotFoundException(`Order with id ${orderItem.orderId} not found`);

    if (order.status) //true = fullfilled
      throw new BadRequestException(`Cannot update item amount for order with id ${orderItem.orderId} because it is already fulfilled`);

    orderItem.amount = amount;
    await this.orderItemRepository.save(orderItem);
    return { message: `Order item amount updated successfully`, orderItem };
  }

  async updateOrder(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOneOrder(id);
    if (!order)
      throw new NotFoundException(`Order with id ${id} not found`);

    if (order.status) //true = fullfilled
      throw new BadRequestException(`Cannot update order with id ${id} because it is already fulfilled`);

    if (updateOrderDto.status && order.draft)
      throw new BadRequestException(`Cannot update order with id ${id} to fulfilled because it is still a draft`);

    await this.orderRepository.update(id, updateOrderDto);

    if (!updateOrderDto.draft && !order.status) { //se o pedido não for mais rascunho e ainda não estiver finalizado
      //notificar cozinha
      this.socket.notifyRole('cozinha', 'new_order');
    }

    return { message: `Order with id ${id} updated successfully` };
  }

  async reOpenOrder(id: number) {
    const order = await this.findOneOrder(id);
    if (!order)
      throw new NotFoundException(`Order with id ${id} not found`);
    if (!order.status)
      throw new BadRequestException(`Order with id ${id} is already open`);

    await this.orderRepository.update(id, { status: false });
    return { message: `Order with id ${id} reopened successfully` };
  }

  async removeOrder(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order)
      throw new NotFoundException(`Order with id ${id} not found`);

    if (order.status) //true = fullfilled
      throw new BadRequestException(`Cannot delete order with id ${id} because it is already fulfilled`);

    await this.orderRepository.delete(id);
    return { message: `Order with id ${id} deleted successfully` };
  }

  async removeOrderItem(id: number) {
    const orderItem = await this.orderItemRepository.findOne({ where: { id } });
    if (!orderItem)
      throw new NotFoundException(`Order item with id ${id} not found`);

    const order = await this.findOneOrder(orderItem.orderId);
    if (!order)
      throw new NotFoundException(`Order with id ${orderItem.orderId} not found`);

    if (order.status) //true = fullfilled
      throw new BadRequestException(`Cannot delete item from order with id ${orderItem.orderId} because it is already fulfilled`);

    const ttlItens = order.itens.length;
    if (ttlItens <= 1)
      throw new BadRequestException(`Cannot delete the last item of order with id ${orderItem.orderId}`);

    await this.orderItemRepository.delete(id);
    return { message: `Order item with id ${id} deleted successfully` };
  }

  //****************************************************************************
  //* METODOS E VARIAVEIS PRIVADAS
  //****************************************************************************

  //+ selectFields → usado com métodos baseados em `findOne` / `find` com suporte a `select` + `relations`.
  //+ Permite limitar os campos retornados tanto da entidade principal quanto de relações.
  //+ Funciona corretamente para relações @ManyToOne, @OneToOne e também para @OneToMany quando eager está desabilitado.
  private readonly selectFields: FindOptionsSelect<Order> = {
    id: true,
    table: true,
    status: true,
    draft: true,
    name: true,
    criadoEm: true,
    user: {
      //id: true,
      name: true,
    },
    itens: {
      id: true,
      amount: true,
      productId: true,
      product: {
        //id: true,
        name: true,
        price: true,
      }
    }
  };

  //+ addSelectAndRelations → usado com QueryBuilder quando se quer controle total sobre
  //+ quais campos e relações são carregados, inclusive para relações OneToMany/ManyToMany.
  private addSelectAndRelations(queryBuilder: SelectQueryBuilder<Order>) { // Adiciona os campos que serão selecionados e as relações necessárias
    queryBuilder.select([
      'order.id',
      'order.table',
      'order.status',
      'order.draft',
      'order.name',
      'order.criadoEm',
      'user.name',
      'itens.id',
      'itens.amount',
      'itens.productId',
      'product.name',
      'product.price'
    ]);

    queryBuilder.leftJoin('order.user', 'user');
    queryBuilder.leftJoin('order.itens', 'itens');
    queryBuilder.leftJoin('itens.product', 'product');
  }

  private addFilters(queryBuilder, filters: GetOrderFilters) {
    if (filters.id)
      queryBuilder.andWhere('order.id = :id', { id: filters.id });

    if (filters.table)
      queryBuilder.andWhere('order.table = :table', { table: filters.table });

    if (filters.status)
      queryBuilder.andWhere('order.status = :status', { status: filters.status });

    if (filters.userId)
      queryBuilder.andWhere('order.userId = :userId', { userId: filters.userId });

    if (filters.draft !== undefined)
      queryBuilder.andWhere('order.draft = :draft', { draft: filters.draft });

    if (filters.name)
      queryBuilder.andWhere('order.name ILIKE :name', { name: `%${filters.name}%` });

    if (filters.productId && filters.fullData) {
      const productIds = Array.isArray(filters.productId)
        ? filters.productId
        : [filters.productId];
      queryBuilder.andWhere('itens.productId IN (:...productIds)', { productIds });
    }
  }

  private async processOrderItemsAsync(entityManager, orderId: number, orderItemDtoList: CreateOrderItemDto[]) {
    const processedItems: { action: string; item: OrderItem }[] = [];

    for (const orderItemDto of orderItemDtoList) {
      // ✅ Validações iniciais
      const product = await this.productService.findOne(orderItemDto.productId);
      if (!product)
        throw new NotFoundException(`Product not found: ${orderItemDto.productId}`);

      //✅ Verificar se item já existe no pedido
      const existingItem = await entityManager.findOne(OrderItem, {
        where: { orderId, productId: orderItemDto.productId }
      });

      if (existingItem) {
        // Atualizar quantidade existente
        existingItem.amount += orderItemDto.amount;
        await entityManager.save(existingItem);
        processedItems.push({ action: 'updated', item: existingItem });
      } else {
        // Criar novo item
        const orderItem = entityManager.create(OrderItem, { ...orderItemDto, orderId });
        await entityManager.save(orderItem);
        processedItems.push({ action: 'created', item: orderItem });
      }
    }
    return processedItems;
  }
}

