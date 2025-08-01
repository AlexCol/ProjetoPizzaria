import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Product } from './entities/product.entity';
import { MultiFormData } from 'src/modules/upload-file/params/multif-form-data.param.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  async findAll(
    @Query('id') id?: number,
    @Query('name') name?: string,
    @Query('category_id') categoryId?: number,
    @Query('bring_category') bringCategory?: boolean,
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    return await this.productService.findAll({
      filters: { id, name, categoryId, bringCategory },
      pagination: baseQuery?.pagination,
      sort: baseQuery?.sort,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number
  ) {
    return await this.productService.findOne(id);
  }

  @Post()
  async create(
    //Param customizado para usar multipart/form-data com validação com fastify
    @MultiFormData({ dtoClass: CreateProductDto, fileName: 'banner' }) createDto: CreateProductDto,
  ) {
    return await this.productService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    //Param customizado para usar multipart/form-data com validação com fastify
    @MultiFormData({ dtoClass: UpdateProductDto, fileName: 'banner' }) updateDto: UpdateProductDto,
  ) {
    return await this.productService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number
  ) {
    return await this.productService.remove(id);
  }
}