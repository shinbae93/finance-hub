# Finance Hub

Personal finance and asset-management dashboard. Nx monorepo with a NestJS API and a React (Vite) web app.

## Prerequisites

- Node 22 LTS (`nvm use` honors `.nvmrc`).
- pnpm 10.x (`npm i -g pnpm@10`).
- PostgreSQL 16 running locally with two empty databases:
  - `finance_hub_dev`
  - `finance_hub_test`

## First-run setup

```bash
pnpm install
cp .env.example .env
# Replace JWT_ACCESS_SECRET with a real 32+ byte random string.
pnpm db:migrate
pnpm dev
```

The API serves at `http://localhost:3000/api`, the web app at `http://localhost:4200`, and Swagger UI at `http://localhost:3000/api/docs`.

## Scripts

| Script                          | Behavior                       |
| ------------------------------- | ------------------------------ |
| `pnpm dev`                      | Run both apps in parallel      |
| `pnpm dev:api` / `pnpm dev:web` | Run a single app               |
| `pnpm build`                    | Build all projects             |
| `pnpm test`                     | Run all unit tests             |
| `pnpm test:e2e`                 | Run Playwright E2E tests       |
| `pnpm lint`                     | Lint everything                |
| `pnpm typecheck`                | TypeScript across the monorepo |
| `pnpm db:migrate`               | `prisma migrate dev`           |
| `pnpm db:reset`                 | `prisma migrate reset`         |
| `pnpm db:studio`                | Open Prisma Studio             |
| `pnpm db:generate`              | Regenerate the Prisma client   |

## Layout

- `apps/api` — NestJS backend.
- `apps/web` — Vite + React frontend.
- `libs/shared-api-types` — FE/BE DTO contract.
- `libs/shared-utils` — Pure helpers for both sides.
- `libs/web-ui` — Tailwind preset + shadcn primitives.
- `prisma/` — Prisma schema and migrations.
- `docs/superpowers/` — Specs and implementation plans.
