import { IsNotEmpty, IsNumber, IsOptional, isString, IsString, MaxLength } from "class-validator";

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

  //@IsString()
  //@IsOptional()
  //banner: string; //removido pois será recebido como arquivo de imagem e o controller irá lidar com isso

  @IsNotEmpty()
  @IsNumber() categoryId: number;
}
