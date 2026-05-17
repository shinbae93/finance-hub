# Dashboard Redesign — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

## Overview

Redesign the app layout from a top navigation bar to a collapsible left sidebar, and build out the previously empty dashboard page with four content sections: total wealth, allocation breakdown, asset history chart, and recent transactions. All dashboard data is placeholder/hardcoded in this phase; wiring up real data is a follow-up task.

---

## Section 1: Shell Layout

### AppShell

`components/app-shell.tsx` changes from a vertical flex column (top-nav + main) to a horizontal flex row (sidebar + main):

```
before: flex-col → <TopNav /> + <main>
after:  flex-row → <SideNav /> + <main>
```

`TopNav` is deleted after `SideNav` replaces it in `AppShell`.

### SideNav

New file: `components/side-nav.tsx`

**Two states:**

- **Expanded** (default): 220px wide. Shows wordmark "FinanceHub", nav links with icon + label, user info (avatar initial, name, email), sign-out button, collapse toggle button labeled "← Collapse".
- **Collapsed**: 72px wide. Shows "FH" monogram, nav links with icon + label stacked (icon above label), collapse toggle button labeled "→".

**Collapse behavior:**

- Toggle button at the bottom of the sidebar switches between states.
- State is persisted in `localStorage` under key `sidebar-collapsed` so it survives page refresh.
- Width transition is animated with a CSS transition (`transition-width duration-200`).

**Active route:** The active nav link gets `background: primary (#fcd535)`, `color: on-primary (#181a20)`, `font-weight: 600`. Inactive links use `color: muted (#707a8a)`, hover to `color: foreground`.

**Nav links (in order):**

1. Dashboard → `/dashboard` — grid/layout icon
2. Stocks → `/stocks` — chart/activity icon

**User section (bottom of sidebar):**

- Avatar: circle with user's first initial, `background: primary`, `color: on-primary`
- Name + email (truncated with ellipsis in expanded state, hidden in collapsed state)
- Sign-out button (existing `useLogout` hook)
- ThemeToggle (moved from TopNav)

**Surface:** `background: surface-card-dark (#1e2329)`, right border `hairline-on-dark (#2b3139)`.

---

## Section 2: Dashboard Content

`pages/dashboard.page.tsx` is rebuilt. Imports widgets from `features/dashboard`.

### Layout (stacked rows)

```
┌─────────────────────────────────────┐
│  Total Wealth Card (full width)     │
├──────────────────┬──────────────────┤
│  Allocation      │  Asset History   │
│  Donut (220px)   │  Chart (flex:1)  │
├─────────────────────────────────────┤
│  Recent Transactions (full width)   │
└─────────────────────────────────────┘
```

### WealthCard

`features/dashboard/components/wealth-card.tsx`

- Label: "TOTAL WEALTH" (muted, uppercase, small)
- Value: `₫1,240,000,000` — `font-number`, `color: primary (#fcd535)`, large (`text-3xl`)
- Badge: "▲ +2.4% this month" — `color: trading-up (#0ecb81)`
- Surface: `surface-card-dark`, border `hairline-on-dark`, `rounded-xl`, padding `p-5`
- All data hardcoded for this phase.

### AllocationChart

`features/dashboard/components/allocation-chart.tsx`

- Recharts `PieChart` with `Pie` using `innerRadius` for donut effect
- 4 hardcoded categories:

| Category | Value | Color token      | Hex     |
| -------- | ----- | ---------------- | ------- |
| Stocks   | 45%   | primary          | #fcd535 |
| Cash     | 25%   | trading-up       | #0ecb81 |
| Gold     | 15%   | accent-turquoise | #2dbdb6 |
| Other    | 15%   | info             | #3b82f6 |

- Legend rendered manually (not Recharts `Legend`) as a vertical list of color swatch + label + percentage, to match the design system typography.
- No tooltip needed for this phase (placeholder data).
- Surface: same card style as WealthCard.

### AssetHistoryChart

`features/dashboard/components/asset-history-chart.tsx`

- Recharts `AreaChart` with a single `Area` series
- Gradient fill: `#fcd535` at 25% opacity fading to 0% — defined via Recharts `<defs><linearGradient>`
- Stroke: `#fcd535`, `strokeWidth: 1.5`
- Time range toggle: 3 buttons (1M / 6M / 1Y). Active button: `background: primary`, `color: on-primary`. Inactive: `background: surface-elevated-dark`.
- Each time range maps to a different hardcoded dataset (6 data points per range).
- `XAxis` tick color: `muted (#707a8a)`. `YAxis` hidden. `CartesianGrid` using `hairline-on-dark`.
- `Tooltip` enabled with dark background (`surface-elevated-dark`), `color: on-dark`, `font-number` for values.
- `ResponsiveContainer` wrapping `AreaChart` for full-width responsiveness.
- Surface: same card style.

### RecentTransactions

`features/dashboard/components/recent-transactions.tsx`

- Card header: "RECENT TRANSACTIONS" label (muted, uppercase) + "View all →" link to `/stocks` (`color: primary`)
- Table columns: Date | Stock | Type | Qty | Value
- 5 hardcoded rows of Vietnamese stock transactions
- `MUA` type: `color: trading-up (#0ecb81)`, `BAN` type: `color: trading-down (#f6465d)`
- Value column: right-aligned, `font-number`, positive values prefixed `+₫`, negative prefixed `-₫`
- Row separator: `hairline-on-dark` border
- Surface: same card style.

---

## Section 3: Component Breakdown

### New files

| File                                                    | Purpose                           |
| ------------------------------------------------------- | --------------------------------- |
| `components/side-nav.tsx`                               | Collapsible left sidebar          |
| `features/dashboard/components/wealth-card.tsx`         | Total wealth banner               |
| `features/dashboard/components/allocation-chart.tsx`    | Donut chart + legend              |
| `features/dashboard/components/asset-history-chart.tsx` | Area chart with time range toggle |
| `features/dashboard/components/recent-transactions.tsx` | Recent transactions table         |
| `features/dashboard/index.ts`                           | Barrel export for all 4 widgets   |

### Modified files

| File                       | Change                                     |
| -------------------------- | ------------------------------------------ |
| `components/app-shell.tsx` | flex-col → flex-row, TopNav → SideNav      |
| `pages/dashboard.page.tsx` | Replace placeholder content with 4 widgets |

### Deleted files

| File                     | Reason              |
| ------------------------ | ------------------- |
| `components/top-nav.tsx` | Replaced by SideNav |

### New dependency

- `recharts` — React chart library for `AreaChart` (asset history) and `PieChart` (allocation donut)
- Install: `pnpm add recharts`

---

## Out of Scope (follow-up tasks)

- Wiring up real portfolio value from `useSummary` to `WealthCard`
- Wiring up real transactions from `useTransactions` to `RecentTransactions`
- Real asset history data (requires new API endpoint or computed from transactions)
- Other asset categories (cash, gold) — requires new DB table for manual balances
- Mobile/responsive layout for sidebar (drawer behavior on small screens)
