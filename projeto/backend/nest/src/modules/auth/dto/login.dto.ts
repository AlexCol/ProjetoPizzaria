import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsString() //just to not be send as: "password": 1234 - must be "password": "1234"
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
