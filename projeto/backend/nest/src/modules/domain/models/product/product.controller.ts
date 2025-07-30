import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, Res, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BaseQueryParam, BaseQueryParamType } from '../../common/params/base-query.param';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as path from 'path';
import * as fs from 'fs-extra'; // Importando fs-extra para manipulação de arquivos

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
    //@Body() createProductDto: CreateProductDto
  ) {
    const buffer = await this.getBannerFromRequest(req);
    if (buffer) {
      const filePath = path.join(__dirname, '..', 'uploads', 'nome-do-arquivo.jpg');
      console.log(`Salvando arquivo em: ${filePath}`);
      await fs.outputFile(filePath, buffer);
    }
    return { message: 'Arquivo salvo com sucesso!' };
    //return await this.productService.create(createProductDto);
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

  private async getBannerFromRequest(req: FastifyRequest) {
    const parts = await req.parts();
    let error: Error | null = null;
    let buffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === 'field' && part.fieldname !== 'banner') {
        error = new BadRequestException(`Unexpected field: ${part.fieldname}`);
      }
      if (part.type === 'file' && part.fieldname === 'banner') {
        buffer = await part.toBuffer();
      }
    }

    if (error) throw error;
    return buffer ?? "";
  }
}

/*
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Post()
async create(@Req() req: FastifyRequest) {
  const data: any = {};
  const parts = await req.parts();
  for await (const part of parts) {
    if (part.type === 'file' && part.fieldname === 'banner') {
      data.banner = part.filename; // ou buffer, se quiser salvar
    } else if (part.type === 'field') {
      data[part.fieldname] = part.value;
    }
  }
  // Validação manual
  const dto = plainToInstance(CreateProductDto, data);
  const errors = await validate(dto);
  if (errors.length) {
    return { statusCode: 400, message: errors.map(e => Object.values(e.constraints)).flat() };
  }
  // ...restante do código...
}
*/