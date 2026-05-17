# Coding Conventions

## Imports & Aliases

- Always use `@finance-hub/shared-api-types` and `@finance-hub/shared-utils` aliases — never relative paths that cross lib boundaries (e.g., `../../libs/...`)
- Import only from a feature's public barrel (`features/auth`, `features/stocks`) — never from internal paths like `features/auth/store/auth.store`

## Frontend Feature Structure

- Every feature under `apps/web/src/features/` must have a public `index.ts` barrel that re-exports its public surface
- No consumer outside the feature directory should import anything not exported from that barrel

## NestJS Modules

- Follow controller → service → repository pattern using `PrismaService` for data access
- Apply `@UseGuards(JwtAuthGuard)` on any route that requires authentication
- Inject dependencies via NestJS DI — no manual instantiation

## Forms

- Use `react-hook-form` + `zod` for all forms; no uncontrolled inputs or raw `useState` for form state

## State Management

- Server state: `@tanstack/react-query` (queries, mutations, caching)
- Client/auth state: Zustand stores only
- Do not mix patterns (no React Query for client-only state, no Zustand for server cache)
