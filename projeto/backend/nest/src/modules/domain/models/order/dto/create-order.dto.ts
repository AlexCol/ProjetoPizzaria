import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsArray, ArrayNotEmpty, MinLength } from "class-validator";
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
  @IsNotEmpty({ message: 'Order name cannot be empty' })
  @MinLength(3, { message: 'Order name must be at least 3 characters long' })
  name: string;

  // @IsNumber()
  // @IsNotEmpty()
  // userId: number; //deve vir do token JWT

  @IsArray()
  //@ArrayNotEmpty({ message: 'Order items cannot be empty' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  itens: CreateOrderItemDto[];
}