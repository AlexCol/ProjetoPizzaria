import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Product } from './entities/product.entity';

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
  async create(
    @Req() req: FastifyRequest
  ) {
    const productData = await this.getFormDataFromRequest(req);
    const dto = await this.validateProductData(productData, CreateProductDto);
    return await this.productService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Req() req: FastifyRequest
  ) {
    const productData = await this.getFormDataFromRequest(req);
    const dto = await this.validateProductData(productData, UpdateProductDto);
    return await this.productService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.productService.remove(id);
  }

  /************************************************************************/
  /************************************************************************/
  /* Metodos privados para validação da entrada via form-data com fastify */
  /************************************************************************/
  /************************************************************************/
  private async getFormDataFromRequest(req: FastifyRequest): Promise<Product> {
    console.log(req.headers);
    const parts = await req.parts();
    let image: Buffer | null = null;
    let productData: any = {};

    for await (const part of parts) {
      const partType = part.type;
      const partFieldName = part.fieldname;

      if (part.type === 'field') {
        productData[part.fieldname] = part.value;
      }

      if (partType == 'file' && partFieldName !== 'banner') {
        throw new BadRequestException(`Unexpected field: ${partFieldName}`);
      }

      if (part.type === 'file') {
        const extension = part.filename.split('.').pop() || '';
        if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
          throw new BadRequestException('Invalid image format. Allowed formats: jpg, jpeg, png, gif');
        }
        image = await part.toBuffer();
      }
    }

    // Converte campos numéricos
    if (productData.price) {
      productData.price = Number(productData.price);
    }
    if (productData.categoryId) {
      productData.categoryId = Number(productData.categoryId);
    }

    // Se houver imagem, converte para base64 ou mantém como buffer
    if (image) {
      productData.banner = image.toString('base64'); // ou salvar o buffer
    }

    return productData;
  }

  private async validateProductData<T extends object>(productData: Product, dtoClass: new () => T): Promise<T> {
    const dto = plainToInstance(dtoClass, productData, { enableImplicitConversion: true });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length) {
      throw new BadRequestException(
        errors.map(e => e.constraints ? Object.values(e.constraints) : []).flat()
      );
    }
    return dto;
  }
}