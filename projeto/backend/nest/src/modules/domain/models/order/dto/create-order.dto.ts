import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  table: number;

  @IsBoolean()
  @IsNotEmpty()
  status: boolean;

  @IsBoolean()
  @IsNotEmpty()
  draft: boolean;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}