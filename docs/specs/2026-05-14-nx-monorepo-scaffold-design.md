# Nx Monorepo Scaffold — Design Spec

**Date:** 2026-05-14
**Status:** Approved (pending user review of written spec)
**Author:** brainstorming session
**Scope:** Initial scaffold for the Finance Hub personal-finance app. No domain features (cash, stocks, gold) yet — those are deferred to follow-up specs.

---

## 1. Purpose & Goals

Establish a production-shaped foundation for the Finance Hub product described in `PROJECT_OVERVIEW.md`. The scaffold proves the architecture end-to-end with a single vertical slice (auth) so that subsequent domain specs (accounts, stocks, gold, transactions) can be implemented on a known-good base.

**In scope**

- Nx integrated monorepo with React (Vite) frontend and NestJS backend.
- PostgreSQL + Prisma persistence.
- JWT-based auth (access + refresh) with a working register → login → protected-route → logout flow.
- Shared TypeScript types library between FE and BE.
- Swagger UI for API documentation/exploration.
- Unit and E2E testing wired in (Jest + Playwright).
- Linting, formatting, type checking, and git hooks.

**Out of scope**

- Cash / Stocks / Gold / Transactions / Dashboard analytics (covered by future specs).
- Market-data integrations (Section 10 of `PROJECT_OVERVIEW.md`).
- Notifications, AI, import/export.
- CI/CD pipeline.
- Production deployment, observability, error tracking.
- Docker (local dev assumes host-installed Postgres).

---

## 2. Architectural Choices (summary)

| Decision           | Choice                                                                        |
| ------------------ | ----------------------------------------------------------------------------- |
| Monorepo tool      | Nx (integrated style)                                                         |
| Package manager    | pnpm                                                                          |
| Node version       | 20 LTS                                                                        |
| Backend framework  | NestJS                                                                        |
| Frontend framework | React 18 via Vite                                                             |
| Routing            | React Router v6                                                               |
| Server state       | TanStack Query                                                                |
| Client state       | zustand (auth only)                                                           |
| UI                 | Tailwind CSS + shadcn/ui                                                      |
| Database           | PostgreSQL (host-installed)                                                   |
| ORM                | Prisma                                                                        |
| API style          | REST under `/api`                                                             |
| API contract       | Shared TS types lib + `@nestjs/swagger` for live docs (no codegen)            |
| Validation         | `class-validator` (BE), `zod` for env (BE + FE)                               |
| Auth               | JWT access (15m) + opaque refresh token (7d, httpOnly cookie, hashed at rest) |
| Unit testing       | Jest                                                                          |
| E2E testing        | Playwright                                                                    |

---

## 3. Monorepo Layout

```
finance-hub/
├── apps/
│   ├── api/                    # NestJS backend
│   ├── api-e2e/                # API integration tests
│   ├── web/                    # Vite + React frontend
│   └── web-e2e/                # Playwright SPA tests
├── libs/
│   ├── shared-api-types/       # FE↔BE DTO/response types (pure TS)
│   ├── shared-utils/           # Pure helpers usable by both sides
│   └── web-ui/                 # shadcn primitives + Tailwind preset
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│
│       ├── specs/
│       └── plans/
├── .env.example
├── .nvmrc
├── nx.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

**Notes**

- Single root `package.json` and `node_modules` (Nx integrated style).
- `prisma/` lives at the root following Prisma CLI defaults. If a second DB consumer (worker, CLI) appears later, it can be promoted to `libs/database/`.
- All libs are non-buildable; consumers import via TS path aliases.
- TS path aliases (in `tsconfig.base.json`):
  - `@finance-hub/shared-api-types` → `libs/shared-api-types/src/index.ts`
  - `@finance-hub/shared-utils` → `libs/shared-utils/src/index.ts`
  - `@finance-hub/web-ui` → `libs/web-ui/src/index.ts`

---

## 4. Backend Structure (`apps/api/src/`)

```
apps/api/src/
├── main.ts                     # bootstrap, CORS, global pipes, Swagger
├── app.module.ts               # root module wires modules/* together
├── config/
│   ├── env.validation.ts       # zod schema for process.env
│   └── config.module.ts
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── filters/                # global exception filters (added when needed)
├── prisma/
│   ├── prisma.module.ts        # @Global()
│   └── prisma.service.ts       # extends PrismaClient, handles lifecycle
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts  # /auth/register, /auth/login, /auth/refresh, /auth/logout
    │   ├── auth.service.ts     # bcrypt, JWT signing, refresh-token lifecycle
    │   ├── strategies/
    │   │   └── jwt.strategy.ts
    │   └── dto/
    │       ├── register.dto.ts
    │       └── login.dto.ts
    ├── users/
    │   ├── users.module.ts
    │   ├── users.controller.ts # GET /users/me  (protected)
    │   └── users.service.ts
    └── health/
        └── health.controller.ts # GET /health  (public)
```

**Conventions**

- `modules/` for feature modules; `common/` for cross-cutting building blocks; `config/` and `prisma/` for infrastructure.
- Global API prefix `/api` (routes become `/api/auth/login`, etc.).
- Global `ValidationPipe` with `class-validator` + `class-transformer`. DTOs are classes so Swagger picks them up automatically.
- Env validated on boot via zod. App fails fast if any required variable is missing.
- CORS allowlist driven by env, default `http://localhost:4200` in dev.
- Swagger UI mounted at `/api/docs`.

**Required environment variables (API)**

- `DATABASE_URL` — Postgres connection string.
- `JWT_ACCESS_SECRET` — signing secret for access tokens.
- `JWT_ACCESS_TTL` — access token TTL (default `15m`).
- `REFRESH_TOKEN_TTL` — refresh token TTL (default `7d`). Refresh tokens are opaque random strings (not JWTs) hashed with bcrypt before persistence; no separate signing secret needed.
- `CORS_ORIGIN` — comma-separated allowlist.
- `PORT` — default `3000`.
- `COOKIE_DOMAIN` — optional, for setting refresh cookie domain in non-dev.

---

## 5. Frontend Structure (`apps/web/src/`)

```
apps/web/src/
├── main.tsx                    # React root, router + QueryClient providers
├── app/
│   ├── app.tsx                 # top-level shell + outlet
│   └── router.tsx              # route definitions (public vs protected)
├── pages/                      # thin route components, one per URL
│   ├── login.page.tsx
│   ├── register.page.tsx
│   ├── dashboard.page.tsx
│   └── not-found.page.tsx
├── features/                   # business capabilities, route-agnostic
│   └── auth/
│       ├── api/
│       │   └── auth.api.ts     # fetch wrappers: register, login, refresh, me, logout
│       ├── hooks/
│       │   ├── use-login.ts
│       │   ├── use-register.ts
│       │   ├── use-logout.ts
│       │   └── use-me.ts
│       ├── components/
│       │   ├── login-form.tsx
│       │   ├── register-form.tsx
│       │   ├── auth-layout.tsx
│       │   └── current-user-card.tsx
│       ├── store/
│       │   └── auth.store.ts   # zustand: { accessToken, user, setSession, clear }
│       ├── guards/
│       │   └── protected-route.tsx
│       └── index.ts            # public re-exports
├── lib/
│   ├── api-client.ts           # fetch wrapper: base URL, auth header, refresh-on-401
│   ├── query-client.ts         # TanStack QueryClient config
│   └── env.ts                  # validates VITE_* env vars at startup
├── styles/
│   └── globals.css             # imports from @finance-hub/web-ui
└── assets/
```

**Pages vs Features rule of thumb**

- A `page` exists because a URL exists. Pages are thin — usually under ~50 lines — and compose feature components.
- A `feature` is a business capability (auth, accounts, stocks, …). Features know nothing about routing.
- Cross-feature imports go through `features/<name>/index.ts`.

**Required environment variables (Web)**

- `VITE_API_URL` — API base URL (e.g. `http://localhost:3000/api`).

**Auth token strategy on the FE**

- Access token: kept only in the zustand store (memory). Lost on hard refresh — recovered by calling `/auth/refresh` on app boot if the refresh cookie is present.
- Refresh token: never readable by JS. Stored as `HttpOnly; Secure; SameSite=Lax` cookie scoped to `/api/auth`.
- `api-client.ts` intercepts 401s and retries once after calling `/auth/refresh`. If refresh fails, store is cleared and user is bounced to `/login`.

---

## 6. Shared Libraries

### `libs/shared-api-types/`

Pure TypeScript. No runtime dependencies. Consumed by both `apps/api` and `apps/web`.

```
src/
├── auth.ts        # RegisterRequest, LoginRequest, AuthTokens, UserDto
├── common.ts      # ApiError, Paginated<T>, branded ISO date string
└── index.ts       # barrel
```

NestJS DTO classes implement these interfaces so the wire shape stays in sync with the shared contract.

### `libs/shared-utils/`

Pure functions safe for Node and the browser. No DOM, no Node-only APIs.

```
src/
├── money.ts       # formatMoney, parseMoney — money helpers from day one
├── date.ts        # ISO formatting helpers
└── index.ts
```

### `libs/web-ui/`

FE-only. Centralizes Tailwind theme and shadcn components.

```
src/
├── components/ui/    # shadcn primitives
├── lib/cn.ts         # clsx + tailwind-merge helper
├── styles/globals.css
├── tailwind.preset.js
└── index.ts
```

`apps/web/tailwind.config.js` extends the preset; theme tokens come from one source.

---

## 7. Data Model (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  fullName      String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id         String    @id @default(uuid())
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  tokenHash  String    @unique           // hash of the opaque refresh token
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())
  userAgent  String?
  ipAddress  String?

  @@index([userId])
}
```

**Design notes**

- UUID PKs everywhere.
- `passwordHash` via `bcrypt` (cost factor 12).
- Refresh tokens are opaque random strings (32 bytes hex). Only their hash is persisted. Lookup is by `tokenHash`.
- `revokedAt` (nullable) supports logout, "sign out everywhere," and rotation-reuse detection without deleting rows.
- `userAgent` and `ipAddress` are nullable today; columns reserved so a future "active sessions" UI needs no migration.
- Domain entities (Account, Transaction, Stock, Gold, …) are deliberately out of scope — handled in follow-up specs where decimal precision and money types can be designed carefully.

---

## 8. Auth Vertical Slice (proof-of-wiring)

### API endpoints

| Method | Path                 | Auth   | Body / Response                                                              |
| ------ | -------------------- | ------ | ---------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | public | `{email, password, fullName?}` → `{user, accessToken}` + sets refresh cookie |
| POST   | `/api/auth/login`    | public | `{email, password}` → `{user, accessToken}` + sets refresh cookie            |
| POST   | `/api/auth/refresh`  | cookie | refresh cookie → `{accessToken}` + rotated refresh cookie                    |
| POST   | `/api/auth/logout`   | cookie | revokes refresh token, clears cookie                                         |
| GET    | `/api/users/me`      | bearer | `{id, email, fullName, createdAt}`                                           |
| GET    | `/api/health`        | public | `{status: 'ok', timestamp}`                                                  |

### Token lifecycle

- **Access token:** JWT, 15 min, signed with `JWT_ACCESS_SECRET`. Payload: `{ sub: userId, email }`. Verified in-process by Passport JWT strategy on every protected request — no DB hit.
- **Refresh token:** opaque random 32-byte hex string. 7-day expiry. Sent only via `HttpOnly; Secure; SameSite=Lax` cookie at path `/api/auth`. Persisted hashed.
- **Rotation:** every `/auth/refresh` call revokes the presented token's row and inserts a new one. If a revoked token is ever presented again, treat as compromise: revoke the whole user's refresh-token family.

### FE flow

1. Anonymous user hits `/dashboard` → `ProtectedRoute` redirects to `/login`.
2. User submits login form → `useLogin` mutation → API returns `accessToken` and sets refresh cookie → token saved to zustand → navigate to `/dashboard`.
3. Dashboard mounts → `useMe` query → 200 → render `<CurrentUserCard>` showing email + `fullName`.
4. If `useMe` returns 401 → `api-client` calls `/auth/refresh` → on success, retries the original request once.
5. Logout → `useLogout` → clears store + `POST /auth/logout` → redirects to `/login`.

### E2E test (Playwright)

`apps/web-e2e/src/auth.spec.ts`:

1. Visit `/dashboard` → expect redirect to `/login`.
2. Click "Create account" → fill register form → submit.
3. Expect redirect to `/dashboard` and the user's email visible.
4. Click logout → expect redirect to `/login`; revisiting `/dashboard` redirects to `/login` again.

Tests use a dedicated test database (`DATABASE_URL_TEST`), reset between runs via `prisma migrate reset --force`.

---

## 9. Tooling & Quality Gates

**Linting & formatting**

- ESLint with Nx preset + `@typescript-eslint`.
- Prettier (single root config).
- `@nx/enforce-module-boundaries` rules:
  - `apps/web` cannot import from `apps/api`.
  - `libs/shared-api-types` cannot import from any FE-only lib.
  - `libs/shared-utils` cannot import from DOM- or Node-only libs.
  - `libs/web-ui` cannot import from `libs/shared-api-types` (UI primitives are domain-agnostic).

**Type checking**

- `tsconfig.base.json` with `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`.
- `pnpm typecheck` → `nx run-many -t typecheck`.

**Git hooks**

- `husky` + `lint-staged` pre-commit: ESLint + Prettier on staged files only.
- Pre-push: `nx affected -t lint typecheck test`.

**Root scripts**

| Script                          | Behavior                                     |
| ------------------------------- | -------------------------------------------- |
| `pnpm dev`                      | `nx run-many -t serve -p api,web` (parallel) |
| `pnpm dev:api` / `pnpm dev:web` | Run a single app                             |
| `pnpm build`                    | `nx run-many -t build`                       |
| `pnpm test`                     | `nx run-many -t test`                        |
| `pnpm test:e2e`                 | `nx run-many -t e2e`                         |
| `pnpm lint`                     | `nx run-many -t lint`                        |
| `pnpm typecheck`                | `nx run-many -t typecheck`                   |
| `pnpm db:migrate`               | `prisma migrate dev`                         |
| `pnpm db:reset`                 | `prisma migrate reset`                       |
| `pnpm db:studio`                | `prisma studio`                              |
| `pnpm db:generate`              | `prisma generate`                            |

**Environment files**

- `.env.example` committed at the root.
- `.env` (gitignored) loaded by both apps.
- `.env.test` for the test database.

**README**
Root README documents prerequisites (Node 20 via `.nvmrc`, pnpm, Postgres 16 installed on host), first-run steps (`pnpm install` → copy `.env.example` to `.env` → create DB → `pnpm db:migrate` → `pnpm dev`), and the script table.

---

## 10. Acceptance Criteria

The scaffold is "done" when all of the following hold:

1. `pnpm install` from a fresh clone succeeds with no warnings about missing peer deps.
2. `pnpm db:migrate` creates `User` and `RefreshToken` tables in the configured Postgres database.
3. `pnpm dev` starts the API on `:3000` and the web app on `:4200` simultaneously.
4. `GET http://localhost:3000/api/health` returns `{ status: 'ok', timestamp }`.
5. Swagger UI is reachable at `http://localhost:3000/api/docs` and lists all six endpoints.
6. Visiting `http://localhost:4200/dashboard` while logged out redirects to `/login`.
7. The full register → dashboard → logout → re-redirect flow works manually in the browser.
8. `pnpm test` passes (unit tests for `auth.service`, `users.service`, and any FE hooks).
9. `pnpm test:e2e` passes the auth E2E spec.
10. `pnpm lint` and `pnpm typecheck` pass with zero errors.
11. Module-boundary rules block forbidden imports (verified by a deliberately-failing test commit, then reverted).

---

## 11. Out-of-Scope / Future Specs

Each item below is a separate future spec:

- **Cash & Accounts** (PROJECT_OVERVIEW §4.1) — `Account`, `Transaction(type=DEPOSIT|WITHDRAWAL|TRANSFER)`.
- **Stocks** (§4.2) — `StockHolding`, `StockTransaction`, P/L calculations.
- **Gold** (§4.3) — `GoldHolding`, `GoldTransaction`, gold-type catalog.
- **Dashboard analytics** (§5) — net worth, allocation, performance.
- **Market data integrations** (§10).
- **Notifications, AI features, import/export** (§12).
- **CI/CD, deployment, observability.**
