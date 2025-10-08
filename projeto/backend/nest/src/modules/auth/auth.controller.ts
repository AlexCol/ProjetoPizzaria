import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { IsPublic } from "src/common/decorators/isPublic";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

const ORIGIN_HEADER = 'x-origin';

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
    if (!req.headers[ORIGIN_HEADER] || (req.headers[ORIGIN_HEADER] !== 'web' && req.headers[ORIGIN_HEADER] !== 'mobile'))
      throw new UnauthorizedException('Invalid credentials!!');

    //! se for web, retorna via cookie
    if (req.headers[ORIGIN_HEADER] === 'web') {
      const auth = await this.authService.login(loginDto);
      addCookies(res, auth, req.headers['remember-me'] === 'true');
      return { message: auth.message, origin: auth.origin };
    }

    //! se for mobile, retorna via json
    if (req.headers[ORIGIN_HEADER] === 'mobile') {
      const auth = await this.authService.login(loginDto);
      const mobileReturn = {
        message: auth.message,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        origin: auth.origin
      }
      return mobileReturn;
    }
  }

  @IsPublic()
  @Post('refresh')
  async refreshTokens(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body() body: { refreshToken?: string }
  ) {
    if (!req.headers[ORIGIN_HEADER] || (req.headers[ORIGIN_HEADER] !== 'web' && req.headers[ORIGIN_HEADER] !== 'mobile'))
      throw new UnauthorizedException('Invalid credentials!!');

    //! se for web, analisa e retorna via cookie
    if (req.headers[ORIGIN_HEADER] === 'web') {
      const refreshTokenCookie = req.cookies['refreshToken'];
      const refreshToken = refreshTokenCookie;
      if (!refreshToken)
        throw new Error('Refresh token not found');

      const auth = await this.authService.refreshTokens({ refreshToken });
      addCookies(res, auth, req.headers['remember-me'] === 'true');
      return { message: auth.message, origin: auth.origin };
    }

    //! se for mobile, retorna via json
    if (req.headers[ORIGIN_HEADER] === 'mobile') {
      if (!body.refreshToken || typeof body.refreshToken !== 'string')
        throw new Error('Refresh token not found');

      const auth = await this.authService.refreshTokens({ refreshToken: body.refreshToken });
      return {
        message: auth.message,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        origin: auth.origin
      };
    }
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