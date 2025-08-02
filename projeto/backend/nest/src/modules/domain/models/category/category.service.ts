import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetCategoryFilters } from './types/categoty.filters';
import { BaseQueryType } from '../../common/types/base-query';
import { ProductService } from '../product/product.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(forwardRef(() => ProductService)) //necessário devido a referencia circular entre CategoryService e ProductService
    private readonly productService: ProductService,

  ) { }

  async findAll(query?: BaseQueryType<GetCategoryFilters>) {
    const { filters, pagination, sort } = query || {};
    const { page = 1, limit = 10 } = pagination || {};
    const { field = 'id', order = 'ASC' } = sort || {};

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (filters)
      this.addFilters(queryBuilder, filters);

    // ✅ Ordenação
    queryBuilder.orderBy(`category.${field}`, order);

    // ✅ Paginação
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // ✅ Execução otimizada
    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      categories,
      total,
    };
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.exists({ where: { name: createCategoryDto.name } });
    if (existingCategory)
      throw new BadRequestException('Category already exists');

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    let categoryExists = await this.categoryRepository.exists({ where: { id } });
    if (!categoryExists)
      throw new BadRequestException('Category not found');

    await this.categoryRepository.update(id, updateCategoryDto);
    return { message: `Category with id ${id} updated successfully` };
  }

  async remove(id: number) {
    let categoryExists = await this.categoryRepository.exists({ where: { id } });
    if (!categoryExists)
      throw new BadRequestException('Category not found');

    const haveProducts = await this.productService.findAll({ filters: { categoryId: id } });
    if (haveProducts.total > 0)
      throw new BadRequestException('Cannot delete category with associated products');

    await this.categoryRepository.delete(id);
    return { message: `Category with id ${id} deleted successfully` };
  }

  private addFilters(queryBuilder, filters: GetCategoryFilters) {
    if (filters.id)
      queryBuilder.andWhere('category.id = :id', { id: filters.id });

    if (filters.name)
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${filters.name}%` });
  }
}
