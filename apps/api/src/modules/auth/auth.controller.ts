import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthSession, RefreshResponse } from '@finance-hub/shared-api-types';
import type { AppConfig } from '../../config/env.validation';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export const REFRESH_COOKIE_NAME = 'fh_refresh';

type CookieMap = Record<string, string | undefined>;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const issued = await this.auth.register(dto);
    this.setRefreshCookie(res, issued.refreshToken, issued.refreshTokenExpiresAt);
    return { user: issued.user, accessToken: issued.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email + password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSession> {
    const issued = await this.auth.login(dto);
    this.setRefreshCookie(res, issued.refreshToken, issued.refreshTokenExpiresAt);
    return { user: issued.user, accessToken: issued.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token + return a new access token' })
  async refresh(
    @Req() req: { cookies: CookieMap },
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponse> {
    const presented = req.cookies?.[REFRESH_COOKIE_NAME] ?? '';
    const issued = await this.auth.refresh(presented);
    this.setRefreshCookie(res, issued.refreshToken, issued.refreshTokenExpiresAt);
    return { accessToken: issued.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(
    @Req() req: { cookies: CookieMap } | CookieMap,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const cookies: CookieMap =
      'cookies' in (req as { cookies?: CookieMap })
        ? (req as { cookies: CookieMap }).cookies
        : (req as CookieMap);
    const presented = cookies?.[REFRESH_COOKIE_NAME] ?? '';
    if (presented) await this.auth.logout(presented);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  }

  private setRefreshCookie(res: Response, value: string, expiresAt: Date): void {
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production';
    res.cookie(REFRESH_COOKIE_NAME, value, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
      expires: expiresAt,
      domain: this.config.get('COOKIE_DOMAIN', { infer: true }) || undefined,
    });
  }
}
