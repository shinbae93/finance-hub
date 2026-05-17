# Claude Config Design

Date: 2026-05-17

## Overview

Configure Claude Code for the finance-hub monorepo by:

1. Adding a Design System pointer to `CLAUDE.md`
2. Creating `.claude/rules/` with three categorical rule files

## CLAUDE.md Changes

Add a `## Design System` section after the `## Commands` section:

```markdown
## Design System

See [DESIGN.md](./DESIGN.md) for the full design system spec — colors, typography, spacing, and component patterns.
```

No tokens or rules inline — just a pointer so Claude knows to read DESIGN.md when doing UI work.

## `.claude/rules/` Structure

### `coding.md`

Monorepo coding conventions:

- Use `@finance-hub/shared-api-types` and `@finance-hub/shared-utils` import aliases, never relative cross-lib imports
- Each feature under `apps/web/src/features/` must expose a public `index.ts` barrel; no direct internal imports from outside the feature
- NestJS modules follow controller → service → repository pattern via PrismaService
- Forms: react-hook-form + zod only; no uncontrolled inputs
- Server state: React Query (`@tanstack/react-query`); client/auth state: Zustand
- No cross-feature direct imports on the frontend — go through the barrel

### `design.md`

Design system application rules:

- Always consult DESIGN.md for color tokens, typography scales, and spacing before writing UI code
- Never hardcode hex colors or font families — use Tailwind classes that map to design tokens
- Use `trading-up` / `trading-down` tokens for all P&L, price-change, and directional signals — never raw green/red
- Use `font-number` utility class for all numeric cells (prices, quantities, percentages)
- Follow DESIGN.md surface hierarchy: `canvas-dark` → `surface-card-dark` → `surface-elevated-dark` for dark mode layering
- Primary CTAs use `primary` (#fcd535) with `on-primary` (#181a20) text

### `workflow.md`

Development workflow rules:

- Run `pnpm typecheck` and `pnpm lint` before every commit
- Use `npx nx test <project>` for targeted tests (api, web, shared-utils), not `pnpm test` for every small change
- After editing `prisma/schema.prisma`, always run `pnpm db:generate` to regenerate the Prisma client
- Swagger UI lives at `http://localhost:3000/api/docs` — verify API changes there
- Branch naming: `feat/`, `fix/`, `chore/` prefixes

## Files to Create/Edit

| Action | Path                                    |
| ------ | --------------------------------------- |
| Edit   | `CLAUDE.md` — add Design System section |
| Create | `.claude/rules/coding.md`               |
| Create | `.claude/rules/design.md`               |
| Create | `.claude/rules/workflow.md`             |
