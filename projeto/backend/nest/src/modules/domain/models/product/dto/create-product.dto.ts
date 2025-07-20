import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  banner: string;

  @IsNotEmpty()
  @IsNumber() categoryId: number;
}
