import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from '../category/category.service';
import { GetProductFilters } from './types/products.filters';
import { BaseQueryType } from '../../common/types/base-query';
import { UploadFileService } from 'src/modules/upload-file/upload-file.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(forwardRef(() => CategoryService)) //necessário devido a referencia circular entre CategoryService e ProductService
    private readonly categoryService: CategoryService,
    private readonly uploadFileService: UploadFileService, // Importando o serviço de upload
  ) { }

  async findAll(query?: BaseQueryType<GetProductFilters>) {
    const { filters, pagination, sort } = query || {};
    const { page = 1, limit = 10 } = pagination || {};
    const { field = 'id', order = 'ASC' } = sort || {};

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (filters)
      this.addFilters(queryBuilder, filters);

    // ✅ Ordenação
    queryBuilder.orderBy(`product.${field}`, order);

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
    return await this.productRepository.findOne({ where: { id } });
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryService.findOne(createProductDto.categoryId);
    if (!category)
      throw new Error('Category not found');

    const nameExists = await this.productRepository.exists({ where: { name: createProductDto.name } });
    if (nameExists)
      throw new Error('Product with this name already exists');

    if (createProductDto.banner) {
      const guuid = crypto.randomUUID();
      createProductDto.banner = await this.uploadFileService.saveFile(createProductDto.banner, 'products', guuid) || "";
    }

    const product = this.productRepository.create({ ...createProductDto, category });
    const newProduct = await this.productRepository.save(product);
    newProduct.banner = await this.uploadFileService.getFile(newProduct.banner, 'products');
    return newProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new Error('Product not found');

    if (updateProductDto.categoryId) {
      const category = await this.categoryService.findOne(updateProductDto.categoryId);
      if (!category)
        throw new Error('Category not found');
    }

    const nameExists = await this.productRepository.exists({ where: { name: updateProductDto.name, id: Not(id) } });
    if (nameExists)
      throw new Error('Product with this name already exists');

    if (updateProductDto.banner) {
      const guuid = crypto.randomUUID();
      updateProductDto.banner = await this.uploadFileService.updateFile(updateProductDto.banner, 'products', guuid, product.banner) || "";
    }

    await this.productRepository.update(id, updateProductDto);
    return "Product updated successfully";
  }

  async remove(id: number) {
    const productExists = await this.productRepository.findOne({ where: { id } });
    if (!productExists)
      throw new Error('Product not found');

    //TODO - pode verificar se o produto está sendo usado em algum pedido antes de remover

    if (productExists.banner)
      await this.uploadFileService.excludeFile(productExists.banner, 'products');

    await this.productRepository.delete(id);
    return "Product removed successfully";
  }

  private addFilters(queryBuilder, filters: GetProductFilters) {
    if (filters.id)
      queryBuilder.andWhere('product.id = :id', { id: filters.id });

    if (filters.name)
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });

    if (filters.categoryId)
      queryBuilder.andWhere('product.category_id = :categoryId', { categoryId: filters.categoryId });
  }
}