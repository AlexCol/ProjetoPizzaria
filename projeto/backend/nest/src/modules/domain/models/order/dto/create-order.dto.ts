import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsArray, ArrayNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  table: number;

  @IsBoolean()
  @IsOptional()
  status: boolean;

  @IsBoolean()
  @IsOptional()
  draft: boolean;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'Order items cannot be empty' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  itens: CreateOrderItemDto[];
}