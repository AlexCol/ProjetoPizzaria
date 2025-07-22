import { Body, Controller, Post } from "@nestjs/common";
import { IsPublic } from "src/common/decorators/isPublic";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @IsPublic()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto
  ) {
    return this.authService.login(loginDto);
  }
}