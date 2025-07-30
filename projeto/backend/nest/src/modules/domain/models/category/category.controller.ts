import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Get()
  async findAll(
    @Query('id') id?: number,
    @Query('name') name?: string,
    @BaseQueryParam() baseQuery?: BaseQueryParamType,
  ) {
    const query = {
      filters: { id, name },
      pagination: baseQuery?.pagination,
      sort: baseQuery?.sort,
    }

    return await this.categoryService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.categoryService.findOne(id);
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.categoryService.remove(id);
  }
}
