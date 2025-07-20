import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Importa o módulo TypeOrm com a entidade Product
    CategoryModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Exporta o ProductService para ser usado em outros módulos
})
export class ProductModule { }
