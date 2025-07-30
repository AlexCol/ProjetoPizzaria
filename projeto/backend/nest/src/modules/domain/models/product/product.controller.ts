import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  async findAll(
    @Query('id') id?: number,
    @Query('name') name?: string,
    @Query('category_id') categoryId?: number,
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    return await this.productService.findAll({
      filters: { id, name, categoryId },
      pagination: baseQuery?.pagination,
      sort: baseQuery?.sort,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.productService.findOne(id);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.productService.remove(id);
  }
}
