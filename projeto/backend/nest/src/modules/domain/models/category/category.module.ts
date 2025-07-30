import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Type } from 'class-transformer';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    forwardRef(() => ProductModule) //necessário pois o ProductModule depende do CategoryModule (é necessário forwardRef ao usar o service no construtor tbm)
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], // Exporta o serviço para ser usado em outros módulos
})
export class CategoryModule { }
