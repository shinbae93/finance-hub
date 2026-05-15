import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:4200')
    .transform((s) =>
      s
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type AppConfig = z.infer<typeof schema>;

export function validateEnv(raw: Record<string, unknown>): AppConfig {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment variables: ${issues}`);
  }
  return result.data;
}
