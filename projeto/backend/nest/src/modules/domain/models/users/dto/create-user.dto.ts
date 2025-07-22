import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator";
import { Permission } from "src/common/enums/permissao.enum";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, { message: 'Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol' })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(Permission, { each: true, message: 'Permissions must be an array of valid Permission enum values' })
  permissions: Permission[];
}