import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoryModule } from '../category/category.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Importa o módulo TypeOrm com a entidade Product
    forwardRef(() => CategoryModule), //necessário pois o CategoryModule depende do ProductModule (é necessário forwardRef ao usar o service no construtor tbm)
    forwardRef(() => OrderModule), // Importa o serviço de upload de arquivos
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Exporta o ProductService para ser usado em outros módulos
})
export class ProductModule { }
