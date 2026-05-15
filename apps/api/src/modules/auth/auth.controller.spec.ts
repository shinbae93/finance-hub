import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController, REFRESH_COOKIE_NAME } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

function makeResponse(): Response & { _cookies: Record<string, { value: string; opts: object }> } {
  const cookies: Record<string, { value: string; opts: object }> = {};
  const res = {
    cookie: (name: string, value: string, opts: object) => {
      cookies[name] = { value, opts };
      return res;
    },
    clearCookie: (name: string) => {
      delete cookies[name];
      return res;
    },
    _cookies: cookies,
  } as unknown as Response & { _cookies: typeof cookies };
  return res;
}

describe('AuthController', () => {
  let controller: AuthController;
  const auth = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('development') },
        },
      ],
    }).compile();
    controller = moduleRef.get(AuthController);
    Object.values(auth).forEach((m) => m.mockReset());
  });

  it('register sets the refresh cookie and returns user+access', async () => {
    auth.register.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', fullName: null, createdAt: '2026-05-14T00:00:00.000Z' },
      accessToken: 'jwt',
      refreshToken: 'rt',
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    const res = makeResponse();
    const result = await controller.register({ email: 'a@b.com', password: 'password123' }, res);
    expect(result).toEqual({
      user: { id: 'u1', email: 'a@b.com', fullName: null, createdAt: '2026-05-14T00:00:00.000Z' },
      accessToken: 'jwt',
    });
    expect(res._cookies[REFRESH_COOKIE_NAME]?.value).toBe('rt');
  });

  it('logout clears the cookie', async () => {
    auth.logout.mockResolvedValue(undefined);
    const res = makeResponse();
    await controller.logout({ cookies: { [REFRESH_COOKIE_NAME]: 'rt' } }, res);
    expect(res._cookies[REFRESH_COOKIE_NAME]).toBeUndefined();
    expect(auth.logout).toHaveBeenCalledWith('rt');
  });
});
