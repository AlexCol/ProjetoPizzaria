import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { IsPublic } from "src/common/decorators/isPublic";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { FastifyReply, FastifyRequest } from "fastify";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @IsPublic()
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() loginDto: LoginDto
  ) {
    const auth = await this.authService.login(loginDto);
    addCookies(res, auth);
    return auth;
  }

  @IsPublic()
  @Post('refresh')
  async refreshTokens(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const refreshTokenCookie = req.cookies['refreshToken'];
    const refreshTokenBody = refreshTokenDto.refreshToken;

    const refreshToken = refreshTokenCookie ?? refreshTokenBody;
    if (!refreshToken)
      throw new Error('Refresh token not found');

    const auth = await this.authService.refreshTokens({ refreshToken });
    addCookies(res, auth);
    return auth;
  }
}

function addCookies(res: FastifyReply, auth: { accessToken: string, refreshToken: string }) {
  res.cookie('accessToken', auth.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Number(process.env.JWT_TOKEN_EXPIRATION ?? '3600')
  });

  res.cookie('refreshToken', auth.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Number(process.env.JWT_REFRESH_EXPIRATION ?? '86400')
  });
}