# Development Workflow

## Before Every Commit

1. `pnpm typecheck` — must pass with zero errors
2. `pnpm lint` — must pass with zero errors

Never commit with type errors or lint failures.

## Running Tests

- Targeted (preferred): `npx nx test api`, `npx nx test web`, `npx nx test shared-utils`
- Full suite: `pnpm test` (slower — use only when validating everything)

## Prisma / Database

- After any change to `prisma/schema.prisma`, run `pnpm db:generate` to regenerate the Prisma client before writing code that uses new schema fields
- To apply migrations: `pnpm db:migrate`
- To reset the DB: `pnpm db:reset`
- Prisma Studio for visual inspection: `pnpm db:studio`

## API Verification

- Swagger UI at `http://localhost:3000/api/docs` — use it to manually verify API changes

## Branch Naming

- `feat/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — config, tooling, non-functional changes

## Dev Servers

- Both API + web: `pnpm dev`
- API only (port 3000): `pnpm dev:api`
- Web only (port 4200): `pnpm dev:web`
