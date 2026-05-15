import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createHash } from 'node:crypto';

type DbUser = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function makeService(deps?: {
  user?: Partial<{
    findUnique: jest.Mock;
    create: jest.Mock;
  }>;
  refreshToken?: Partial<{
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  }>;
  configValues?: Record<string, unknown>;
}): { service: AuthService; prisma: PrismaService; jwt: JwtService } {
  const refreshTokenMethods = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    ...deps?.refreshToken,
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      ...deps?.user,
    },
    refreshToken: refreshTokenMethods,
    // Execute transaction callback with a tx proxy that delegates to the same mocks.
    $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) =>
      cb({ refreshToken: refreshTokenMethods }),
    ),
  } as unknown as PrismaService;

  const jwt = {
    signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
  } as unknown as JwtService;

  const config = {
    get: jest.fn((key: string) => {
      const defaults: Record<string, unknown> = {
        JWT_ACCESS_SECRET: 'x'.repeat(32),
        JWT_ACCESS_TTL: '15m',
        REFRESH_TOKEN_TTL: '7d',
      };
      return deps?.configValues?.[key] ?? defaults[key];
    }),
  } as unknown as ConfigService<Record<string, unknown>, true>;

  return { service: new AuthService(prisma, jwt, config as never), prisma, jwt };
}

describe('AuthService.register', () => {
  it('hashes the password, creates the user, and returns access token + refresh token', async () => {
    const created: DbUser = {
      id: 'u1',
      email: 'a@b.com',
      passwordHash: 'hashed',
      fullName: 'A',
      createdAt: new Date('2026-05-14T00:00:00Z'),
      updatedAt: new Date('2026-05-14T00:00:00Z'),
    };
    const { service, prisma } = makeService({
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(created),
      },
    });

    const result = await service.register({
      email: 'a@b.com',
      password: 'password123',
      fullName: 'A',
    });

    expect(result.user.email).toBe('a@b.com');
    expect(result.accessToken).toBe('signed.jwt.token');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.refreshToken.length).toBe(64);
    expect((prisma.user.create as jest.Mock).mock.calls[0][0].data.passwordHash).not.toBe(
      'password123',
    );
  });

  it('throws ConflictException when email already exists', async () => {
    const { service } = makeService({
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com' }),
      },
    });

    await expect(
      service.register({ email: 'a@b.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('AuthService.login', () => {
  it('returns tokens when credentials match', async () => {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('password123', 4);
    const fixture = makeService({
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@b.com',
          passwordHash: hash,
          fullName: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    });
    const result = await fixture.service.login({ email: 'a@b.com', password: 'password123' });
    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.refreshToken).toMatch(/^[0-9a-f]{64}$/);
  });

  it('throws UnauthorizedException for wrong password', async () => {
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('correct', 4);
    const { service } = makeService({
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          email: 'a@b.com',
          passwordHash: hash,
          fullName: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    });
    await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException for unknown email', async () => {
    const { service } = makeService({
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    await expect(service.login({ email: 'x@y.com', password: 'whatever1' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('AuthService.refresh', () => {
  it('rotates the refresh token and returns a new access token', async () => {
    const presentedToken = 'a'.repeat(64);
    // Use sha256 for lookup (matches implementation)
    const storedHash = createHash('sha256').update(presentedToken).digest('hex');

    const { service } = makeService({
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'rt1',
          userId: 'u1',
          tokenHash: storedHash,
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          user: {
            id: 'u1',
            email: 'a@b.com',
            fullName: null,
            createdAt: new Date(),
          },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({}),
      },
    });

    const result = await service.refresh(presentedToken);
    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.refreshToken).toMatch(/^[0-9a-f]{64}$/);
    expect(result.refreshToken).not.toBe(presentedToken);
  });

  it('revokes all user refresh tokens if a revoked token is presented (reuse detection)', async () => {
    const presentedToken = 'b'.repeat(64);
    const storedHash = createHash('sha256').update(presentedToken).digest('hex');
    const updateMany = jest.fn().mockResolvedValue({ count: 3 });

    const { service } = makeService({
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'rt1',
          userId: 'u1',
          tokenHash: storedHash,
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: new Date(Date.now() - 1_000),
          user: { id: 'u1', email: 'a@b.com', fullName: null, createdAt: new Date() },
        }),
        updateMany,
      },
    });

    await expect(service.refresh(presentedToken)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(updateMany).toHaveBeenCalled();
  });
});

describe('AuthService.logout', () => {
  it('revokes the presented refresh token if it matches', async () => {
    const presentedToken = 'c'.repeat(64);
    const storedHash = createHash('sha256').update(presentedToken).digest('hex');
    const update = jest.fn().mockResolvedValue({});

    const { service } = makeService({
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'rt1',
          userId: 'u1',
          tokenHash: storedHash,
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
        }),
        update,
      },
    });

    await service.logout(presentedToken);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'rt1' },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('is a no-op for an unknown refresh token', async () => {
    const { service } = makeService({
      refreshToken: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    await expect(service.logout('missing')).resolves.toBeUndefined();
  });
});
