import { randomBytes, createHash } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { AuthSession, RefreshResponse, UserDto } from '@finance-hub/shared-api-types';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppConfig } from '../../config/env.validation';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

interface IssuedTokens extends AuthSession {
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const BCRYPT_COST = 12;
const REFRESH_TOKEN_BYTES = 32;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, fullName: dto.fullName ?? null },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<IssuedTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  async refresh(
    presentedToken: string,
  ): Promise<RefreshResponse & { refreshToken: string; refreshTokenExpiresAt: Date }> {
    const row = await this.findRefreshTokenByHash(presentedToken);
    if (!row) throw new UnauthorizedException('Invalid refresh token');

    if (row.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (row.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });

    const newToken = this.generateRefreshToken();
    const newTokenHash = this.hashToken(newToken);
    const ttlMs = this.parseDurationMs(this.config.get('REFRESH_TOKEN_TTL', { infer: true }));
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.prisma.refreshToken.create({
      data: { userId: row.userId, tokenHash: newTokenHash, expiresAt },
    });

    const accessToken = await this.signAccessToken({ sub: row.userId, email: row.user.email });
    return { accessToken, refreshToken: newToken, refreshTokenExpiresAt: expiresAt };
  }

  async logout(presentedToken: string): Promise<void> {
    const row = await this.findRefreshTokenByHash(presentedToken);
    if (!row) return;
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    fullName: string | null;
    createdAt: Date;
  }): Promise<IssuedTokens> {
    const accessToken = await this.signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = this.hashToken(refreshToken);
    const ttlMs = this.parseDurationMs(this.config.get('REFRESH_TOKEN_TTL', { infer: true }));
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refreshTokenHash, expiresAt },
    });

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString() as UserDto['createdAt'],
    };

    return { user: userDto, accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
  }

  private signAccessToken(payload: { sub: string; email: string }): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
      expiresIn: this.config.get('JWT_ACCESS_TTL', { infer: true }),
    });
  }

  private generateRefreshToken(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async findRefreshTokenByHash(token: string): Promise<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    user: { id: string; email: string; fullName: string | null; createdAt: Date };
  } | null> {
    const hash = this.hashToken(token);
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: true },
    }) as Promise<{
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      revokedAt: Date | null;
      user: { id: string; email: string; fullName: string | null; createdAt: Date };
    } | null>;
  }

  private parseDurationMs(input: string): number {
    const m = /^(\d+)([smhd])$/.exec(input);
    if (!m) throw new Error(`Invalid duration: ${input}`);
    const value = Number.parseInt(m[1] ?? '0', 10);
    const unit = m[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return value * (multipliers[unit] ?? 1_000);
  }
}
