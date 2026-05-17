# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Run API + web in parallel
pnpm dev:api          # API only (http://localhost:3000/api)
pnpm dev:web          # Web only (http://localhost:4200)
pnpm build            # Build all projects
pnpm test             # Run all unit tests
pnpm lint             # Lint everything
pnpm typecheck        # TypeScript check across monorepo

# Run tests for a single project
npx nx test api
npx nx test web
npx nx test shared-utils

# Database
pnpm db:migrate       # prisma migrate dev
pnpm db:reset         # prisma migrate reset
pnpm db:generate      # Regenerate Prisma client after schema changes
pnpm db:studio        # Open Prisma Studio
```

Swagger UI is at `http://localhost:3000/api/docs`.

## Docs

- Design specs go in `docs/specs/`
- Implementation plans go in `docs/plans/`

## Design System

See [DESIGN.md](./DESIGN.md) for the full design system spec — colors, typography, spacing, and component patterns.

## Architecture

Nx monorepo with:

- `apps/api` — NestJS backend
- `apps/web` — Vite + React 19 frontend
- `libs/shared-api-types` — DTO types shared between FE and BE (import as `@finance-hub/shared-api-types`)
- `libs/shared-utils` — Pure utility helpers (import as `@finance-hub/shared-utils`)
- `libs/web-ui` — Tailwind preset + shadcn primitives
- `prisma/` — Prisma schema and migrations (PostgreSQL)

### API (NestJS)

Modules live in `apps/api/src/modules/`: `auth`, `users`, `stocks`, `health`. Each follows NestJS module conventions (controller → service → repository pattern via Prisma).

- `apps/api/src/prisma/` — `PrismaModule`/`PrismaService` injected across modules
- `apps/api/src/common/guards/` — `JwtAuthGuard` (apply with `@UseGuards(JwtAuthGuard)`)
- `apps/api/src/common/decorators/` — custom parameter decorators
- `apps/api/src/config/` — typed config via `ConfigModule`
- Auth uses JWT access tokens + refresh tokens stored as hashed values in the DB. Refresh tokens track `userAgent` and `ipAddress`.

### Web (React + Vite)

Feature-based structure under `apps/web/src/features/` (`auth`, `stocks`). Each feature exposes a public `index.ts` barrel.

- Routing: `apps/web/src/app/router.tsx` using `react-router-dom` v6
- Auth state: Zustand store at `features/auth/store/auth.store.ts` holds `accessToken` + `user`
- API client: `apps/web/src/lib/api-client.ts` — a fetch wrapper that handles JWT injection, silent token refresh (single in-flight refresh promise to prevent concurrent 401 races), and auth failure callbacks. Configure via `configureApiClient()`.
- `useAuthBootstrap` hook (called once in `App`) rehydrates auth state before rendering routes.
- React Query (`@tanstack/react-query`) for server state; Zustand for client/auth state; react-hook-form + zod for forms.

### Data model

`User` → `StockTransaction` (1:many). `StockTransaction` stores Vietnamese stock trades with `MUA`/`BAN` enum (`TransactionType`). `RefreshToken` is a separate table (not stored in user session, only hashed on disk).
