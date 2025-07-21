import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
}