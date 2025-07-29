import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { EntityManager, Repository } from 'typeorm';
import { GetCategoryFilters } from './types/categoty.filters';
import { BaseQueryType } from '../../common/types/base-query';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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
    return "Category updated successfully";
  }

  async remove(id: number) {
    let categoryExists = await this.categoryRepository.exists({ where: { id } });
    if (!categoryExists)
      throw new BadRequestException('Category not found');

    //TODO - pode verificar se a categoria está sendo usada em algum produto antes de remover

    await this.categoryRepository.delete(id);
    return "Category removed successfully";
  }

  private addFilters(queryBuilder, filters: GetCategoryFilters) {
    if (filters.id)
      queryBuilder.andWhere('category.id = :id', { id: filters.id });

    if (filters.name)
      queryBuilder.andWhere('category.name ILIKE :name', { name: `%${filters.name}%` });
  }
}
