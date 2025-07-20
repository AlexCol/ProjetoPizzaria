import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  name: string;
}
