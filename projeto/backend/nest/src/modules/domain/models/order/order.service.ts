import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FindOptionsSelect, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { ProductService } from '../product/product.service';
import { GetOrderFilters } from './param/order-query.param';
import { BaseQueryType } from '../../common/types/base-query';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProductService)) //necessário devido a referencia circular entre ProductService e OrderService
    private readonly productService: ProductService,
  ) { }

  //****************************************************************************
  //* METODOS PUBLICOS
  //****************************************************************************
  async findAll(query?: BaseQueryType<GetOrderFilters>) {
    const { filters, pagination, sort } = query || {};
    const { page = 1, limit = 10 } = pagination || {};
    const { field = 'id', order = 'ASC' } = sort || {};

    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    this.addSelectAndRelations(queryBuilder);

    if (filters)
      this.addFilters(queryBuilder, filters);

    // ✅ Ordenação
    queryBuilder.orderBy(`order.${field}`, order);

    // ✅ Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // ✅ Execução otimizada
    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders,
      total,
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      select: this.selectFields,
      where: { id },
      relations: ['user', 'itens', 'itens.product']
    });

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    const user = await this.usersService.findOne(createOrderDto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    for (const ordemItem of createOrderDto.itens) {
      const product = await this.productService.findOne(ordemItem.productId);
      if (!product) {
        throw new Error(`Product not found: ${ordemItem.productId}`);
      }
    }

    const order = this.orderRepository.create({ ...createOrderDto, user });
    return await this.orderRepository.save(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return "update order - not ready"; //await this.orderRepository.update(id, updateOrderDto);
  }

  async remove(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order)
      throw new Error(`Order with id ${id} not found`);

    if (order.status) //true = fullfilled
      throw new Error(`Cannot delete order with id ${id} because it is already fulfilled`);

    await this.orderRepository.delete(id);
    return { message: `Order with id ${id} deleted successfully` };
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

    if (filters.productId) {
      const productIds = Array.isArray(filters.productId)
        ? filters.productId
        : [filters.productId];
      queryBuilder.andWhere('itens.productId IN (:...productIds)', { productIds });
    }
  }
}

