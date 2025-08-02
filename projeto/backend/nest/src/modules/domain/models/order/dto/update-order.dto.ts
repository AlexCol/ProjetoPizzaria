import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {

}

// import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

// export class UpdateOrderDto {
//   @IsNumber()
//   @IsOptional()
//   table?: number;

//   @IsBoolean()
//   @IsOptional()
//   status?: boolean;

//   @IsBoolean()
//   @IsOptional()
//   draft?: boolean;

//   @IsString()
//   @IsOptional()
//   name?: string;

//   @IsNumber()
//   @IsOptional()
//   userId?: number;

//   // itens não está incluído - não pode ser atualizado
// }

