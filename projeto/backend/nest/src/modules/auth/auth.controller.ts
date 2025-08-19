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
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() loginDto: LoginDto
  ) {
    const auth = await this.authService.login(loginDto);
    addCookies(res, auth, req.headers['remember-me'] === 'true');
    return { message: auth.message, origin: auth.origin };
  }

  @IsPublic()
  @Post('refresh')
  async refreshTokens(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshTokenCookie = req.cookies['refreshToken'];
    const refreshToken = refreshTokenCookie;
    if (!refreshToken)
      throw new Error('Refresh token not found');

    const auth = await this.authService.refreshTokens({ refreshToken });
    addCookies(res, auth, req.headers['remember-me'] === 'true');
    return { message: auth.message, origin: auth.origin };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}

function addCookies(res: FastifyReply, auth: { accessToken: string, refreshToken: string }, rememberMe?: boolean) {
  res.cookie('accessToken', auth.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? Number(process.env.JWT_TOKEN_EXPIRATION ?? '3600') : undefined
  });

  res.cookie('refreshToken', auth.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? Number(process.env.JWT_REFRESH_EXPIRATION ?? '86400') : undefined
  });
}