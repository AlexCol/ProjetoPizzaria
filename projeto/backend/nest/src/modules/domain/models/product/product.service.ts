import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFileService } from 'src/modules/upload-file/upload-file.service';
import { Not, Repository } from 'typeorm';
import { BaseQueryType } from '../../common/types/base-query';
import { CategoryService } from '../category/category.service';
import { OrderService } from '../order/order.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { GetProductFilters } from './types/products.filters';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(forwardRef(() => CategoryService)) //necessário devido a referencia circular entre CategoryService e ProductService
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => OrderService)) //necessário devido a referencia circular entre ProductService e OrderService
    private readonly orderService: OrderService,
    private readonly uploadFileService: UploadFileService, // Importando o serviço de upload
  ) { }

  //****************************************************************************
  //* METODOS PUBLICOS
  //****************************************************************************
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
    const [products, total] = await queryBuilder.getManyAndCount();

    for (const product of products)
      product.banner = filters?.bringBanner
        ? await this.uploadFileService.getFile(product.banner || '', 'products')
        : undefined;

    return {
      products,
      total,
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
    if (product && product.banner)
      product.banner = await this.uploadFileService.getFile(product.banner, 'products');
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    await this.createValidations(createProductDto);

    const product = this.productRepository.create({ ...createProductDto, banner: '' });
    const newProduct = await this.productRepository.save(product);

    await this.createSetBanner(createProductDto, newProduct);
    return newProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.updateValidations(id, updateProductDto);

    if (updateProductDto.banner)
      updateProductDto.banner = await this.uploadFileService.updateFile(updateProductDto.banner, 'products', `product_${product.id}`, product.banner);

    await this.productRepository.update(id, updateProductDto);
    return { message: `Product with id ${id} updated successfully` };
  }

  async remove(id: number) {
    const product = await this.removeValidations(id);
    await this.productRepository.delete(id); //primeiro remove o produto do banco e depois exclui a imagem do banner
    if (product.banner)
      await this.uploadFileService.excludeFile(product.banner, 'products');

    return { message: `Product with id ${id} deleted successfully` };
  }

  //****************************************************************************
  //* METODOS PRIVADOS
  //****************************************************************************

  private addFilters(queryBuilder, filters: GetProductFilters) {
    if (filters.id)
      queryBuilder.andWhere('product.id = :id', { id: filters.id });

    if (filters.name)
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });

    if (filters.categoryId)
      queryBuilder.andWhere('product.category_id = :categoryId', { categoryId: filters.categoryId });

    if (filters.bringCategory)
      queryBuilder.leftJoinAndSelect('product.category', 'category');
  }

  private async createValidations(createProductDto: CreateProductDto) {
    //! validações
    const category = await this.categoryService.findOne(createProductDto.categoryId);
    if (!category)
      throw new NotFoundException('Category not found');

    const nameExists = await this.productRepository.exists({ where: { name: createProductDto.name } });
    if (nameExists)
      throw new BadRequestException('Product with this name already exists');
  }

  private async createSetBanner(createProductDto: CreateProductDto, newProduct: Product) {
    //! salva o banner se fornecido
    if (createProductDto.banner) {
      createProductDto.banner = await this.uploadFileService.saveFile(createProductDto.banner, 'products', `product_${newProduct.id}`);
      newProduct.banner = createProductDto.banner; // Atualiza o banner do produto com o nome do arquivo salvo
      await this.productRepository.update(newProduct.id, { banner: newProduct.banner });
    }

    //! busca o banner atualizado pra garantir o envio em base64
    if (newProduct.banner)
      newProduct.banner = await this.uploadFileService.getFile(newProduct.banner, 'products');
  }

  private async updateValidations(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException('Product not found');

    if (updateProductDto.categoryId) {
      const category = await this.categoryService.findOne(updateProductDto.categoryId);
      if (!category)
        throw new NotFoundException('Category not found');
    }

    if (updateProductDto.name) {
      const nameExists = await this.productRepository.findOne({ where: { name: updateProductDto.name, id: Not(id) } });
      if (nameExists)
        throw new BadRequestException('Product with this name already exists');
    }

    return product;
  }

  private async removeValidations(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException('Product not found');

    const orders = await this.orderService.findAllOrders({ filters: { productId: id, fullData: true } });
    if (orders.total > 0)
      throw new BadRequestException('Cannot delete product that is associated with orders');

    return product;
  }
}