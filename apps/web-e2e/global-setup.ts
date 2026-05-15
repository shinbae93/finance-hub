import { execSync } from 'node:child_process';

export default async function globalSetup(): Promise<void> {
  const dbUrl = process.env['DATABASE_URL_TEST'] ?? process.env['DATABASE_URL'] ?? '';
  // Apply any pending migrations to the test DB (non-destructive).
  // Use 'migrate deploy' so Prisma's AI-agent guard is not triggered.
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
  });
}
