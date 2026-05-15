import { validateEnv } from './env.validation';

const VALID = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_ACCESS_TTL: '15m',
  REFRESH_TOKEN_TTL: '7d',
  CORS_ORIGIN: 'http://localhost:4200',
  PORT: '3000',
};

describe('validateEnv', () => {
  it('returns a parsed config when all required values are present', () => {
    const cfg = validateEnv(VALID);
    expect(cfg.PORT).toBe(3000);
    expect(cfg.JWT_ACCESS_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(cfg.CORS_ORIGIN).toEqual(['http://localhost:4200']);
  });

  it('splits CORS_ORIGIN on commas', () => {
    const cfg = validateEnv({ ...VALID, CORS_ORIGIN: 'http://a.com,http://b.com' });
    expect(cfg.CORS_ORIGIN).toEqual(['http://a.com', 'http://b.com']);
  });

  it('throws when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = VALID;
    expect(() => validateEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('throws when JWT_ACCESS_SECRET is shorter than 32 chars', () => {
    expect(() => validateEnv({ ...VALID, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET/,
    );
  });
});
