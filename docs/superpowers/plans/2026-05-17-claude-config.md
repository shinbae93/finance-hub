# Claude Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Claude Code for the finance-hub monorepo with a Design System pointer in CLAUDE.md and categorical rule files in `.claude/rules/`.

**Architecture:** Add a single `## Design System` section to the existing `CLAUDE.md`, then create `.claude/rules/` directory with three focused rule files (`coding.md`, `design.md`, `workflow.md`) covering monorepo conventions, design token usage, and dev workflow respectively.

**Tech Stack:** Markdown, Claude Code `.claude/rules/` convention.

---

## File Map

| Action | Path                        | Responsibility                              |
| ------ | --------------------------- | ------------------------------------------- |
| Modify | `CLAUDE.md`                 | Add `## Design System` pointer to DESIGN.md |
| Create | `.claude/rules/coding.md`   | Monorepo coding conventions                 |
| Create | `.claude/rules/design.md`   | Design system application rules             |
| Create | `.claude/rules/workflow.md` | Dev workflow rules                          |

---

### Task 1: Add Design System section to CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Insert the Design System section**

Open `CLAUDE.md`. After the closing ` ``` ` of the `## Commands` block and before `## Architecture`, insert:

```markdown
## Design System

See [DESIGN.md](./DESIGN.md) for the full design system spec — colors, typography, spacing, and component patterns.
```

- [ ] **Step 2: Verify the file reads correctly**

Run:

```bash
grep -n "Design System" CLAUDE.md
```

Expected output:

```
<line_number>:## Design System
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): add Design System pointer to DESIGN.md"
```

---

### Task 2: Create `.claude/rules/coding.md`

**Files:**

- Create: `.claude/rules/coding.md`

- [ ] **Step 1: Create the rules directory and file**

```bash
mkdir -p .claude/rules
```

Create `.claude/rules/coding.md` with this exact content:

```markdown
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
```

- [ ] **Step 2: Verify file exists**

```bash
cat .claude/rules/coding.md
```

Expected: file contents printed without error.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/coding.md
git commit -m "chore(claude): add coding conventions rules file"
```

---

### Task 3: Create `.claude/rules/design.md`

**Files:**

- Create: `.claude/rules/design.md`

- [ ] **Step 1: Create the file**

Create `.claude/rules/design.md` with this exact content:

```markdown
# Design System Rules

## Source of Truth

- Always read DESIGN.md before writing any UI code that involves color, typography, spacing, or component structure
- The design spec is at `./DESIGN.md` in the repo root

## Color Tokens

- Never hardcode hex values — use the Tailwind utility classes that map to design tokens defined in `libs/web-ui`
- For P&L values, price changes, and any directional signal: use `trading-up` (green, #0ecb81) and `trading-down` (red, #f6465d) tokens — never raw `text-green-*` or `text-red-*`
- Primary CTAs must use the `primary` token (#fcd535) with `on-primary` (#181a20) foreground text

## Typography

- Never hardcode `font-family` inline — use the type scale classes from DESIGN.md
- For all numeric cells (prices, quantities, percentages, P&L): apply the `font-number` utility class

## Surface Hierarchy (Dark Mode)

Layer surfaces in this order from base to elevated:

1. `canvas-dark` (#0b0e11) — page background
2. `surface-card-dark` (#1e2329) — cards
3. `surface-elevated-dark` (#2b3139) — dropdowns, modals, tooltips

## Light Mode

- `canvas-light` (#ffffff) / `surface-soft-light` (#fafafa) / `surface-strong-light` (#f5f5f5) for light surfaces
- Hairlines: `hairline-on-light` (#eaecef) on light, `hairline-on-dark` (#2b3139) on dark
```

- [ ] **Step 2: Verify file exists**

```bash
cat .claude/rules/design.md
```

Expected: file contents printed without error.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/design.md
git commit -m "chore(claude): add design system rules file"
```

---

### Task 4: Create `.claude/rules/workflow.md`

**Files:**

- Create: `.claude/rules/workflow.md`

- [ ] **Step 1: Create the file**

Create `.claude/rules/workflow.md` with this exact content:

```markdown
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
```

- [ ] **Step 2: Verify file exists**

```bash
cat .claude/rules/workflow.md
```

Expected: file contents printed without error.

- [ ] **Step 3: Commit**

```bash
git add .claude/rules/workflow.md
git commit -m "chore(claude): add workflow rules file"
```

---

### Task 5: Final verification

- [ ] **Step 1: Confirm all files are in place**

```bash
ls .claude/rules/
```

Expected:

```
coding.md  design.md  workflow.md
```

- [ ] **Step 2: Confirm CLAUDE.md contains Design System section**

```bash
grep -A2 "## Design System" CLAUDE.md
```

Expected:

```
## Design System

See [DESIGN.md](./DESIGN.md) for the full design system spec — colors, typography, spacing, and component patterns.
```

- [ ] **Step 3: Confirm git log shows all 4 commits**

```bash
git log --oneline -5
```

Expected to see commits for workflow, design, coding, and CLAUDE.md in recent history.
