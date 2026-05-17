# Cash Tab — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

---

## Overview

A new `/cash` route and sidebar nav entry displaying the user's cash position. Unlike Stocks, Cash is a single flat page — no sub-tabs, no sub-nav sidebar.

---

## Route & Navigation

- **Route:** `/cash`
- **Sidebar entry:** added to `NAV_LINKS` in `apps/web/src/components/side-nav.tsx`, after Stocks, using `Wallet` icon from lucide-react
- **Page component:** `apps/web/src/pages/cash.page.tsx`
- **Feature directory:** `apps/web/src/features/cash/` with a public `index.ts` barrel

---

## Page Layout

Full-width content area (no sub-nav sidebar). Mirrors the structure of the Stocks page content panel.

```
┌─────────────────────────────────────────────────┐
│  Cash                          [+ Add Transaction]│
├─────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │ Total Balance│ │In This Month │ │Out This Mo│ │
│  │  ₫120,000,000│ │ +₫18,500,000 │ │−₫14,000,00│ │
│  │ ▲ +3.9% MoM  │ │  3 deposits  │ │9 withdrawa│ │
│  └──────────────┘ └──────────────┘ └───────────┘ │
│                                                   │
│  ┌───────────────────────────────────────────┐    │
│  │ BALANCE OVER TIME          [1M] [6M] [1Y] │    │
│  │  (area chart, yellow gradient, Recharts)  │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  Transactions                        [12 entries] │
│  ┌───────────────────────────────────────────┐    │
│  │ Description │ Date │ Type  │ Amount        │    │
│  │─────────────┼──────┼───────┼───────────── │    │
│  │ Salary      │May 1 │ IN    │ +₫15,000,000 │    │
│  │ Rent        │May 3 │ OUT   │  −₫5,000,000 │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Sections

### 1. Page Header

- Title: "Cash" (`text-lg font-semibold`)
- Right side: `+ Add Transaction` button using `primary` token (`bg-[#fcd535] text-[#181a20]`)
- Bottom border separating from content

### 2. Stat Cards (3-column grid)

| Card           | Value             | Sub-text                | Color                                    |
| -------------- | ----------------- | ----------------------- | ---------------------------------------- |
| Total Balance  | total cash amount | `▲/▼ +X% vs last month` | `text-foreground`, sentiment on sub-text |
| In This Month  | sum of inflows    | `N deposits`            | `text-trading-up`                        |
| Out This Month | sum of outflows   | `N withdrawals`         | `text-trading-down`                      |

- Grid: `grid-cols-3 gap-3` (collapses to `grid-cols-1 sm:grid-cols-3`)
- Card style: `rounded-lg border border-border bg-card p-4` (matches existing `StatCard` in `summary-tab.tsx`)
- Values use `font-number` utility class
- MoM % on Total Balance: green if positive, red if negative, neutral if zero

### 3. Balance Over Time Chart

- Recharts `AreaChart` inside `ResponsiveContainer`
- Yellow area gradient: `#fcd535` at 20% opacity → 0% (matches `asset-history-chart.tsx` pattern)
- Stroke: `#fcd535`, `strokeWidth: 1.5`
- Range toggle: `1M | 6M | 1Y` — active pill `bg-[#fcd535] text-[#181a20]`, inactive `bg-muted text-foreground`
- X-axis: date labels, no axis line, no tick lines
- Tooltip: shows formatted ₫ amount (same `ChartTooltip` pattern as `asset-history-chart.tsx`)
- Fake data: realistic monthly cash balance snapshots per range

### 4. Transactions Table

- Section heading `"Transactions"` + entry count badge (muted pill)
- Table columns: **Description**, **Date**, **Type**, **Amount**
- **Type** badge: `IN` (green tint `bg-[#e6faf3] text-trading-up`) / `OUT` (red tint `bg-[#fef0f1] text-trading-down`)
- **Amount**: right-aligned, `font-number`, `text-trading-up` for IN, `text-trading-down` for OUT
- Table style: `rounded-lg border border-border overflow-hidden`, thead `bg-muted`, rows `divide-y divide-border hover:bg-muted/50`
- Add Transaction modal: placeholder modal (title + close button only, no form fields yet — API integration deferred)

---

## Fake Data

All data is static/hardcoded in the feature directory. No API calls.

**Stat cards:**

- Total Balance: ₫120,000,000 (+3.9% MoM)
- In: +₫18,500,000 (3 deposits)
- Out: −₫14,000,000 (9 withdrawals)

**Chart data (1M):** weekly snapshots showing upward trend  
**Chart data (6M):** monthly snapshots  
**Chart data (1Y):** bi-monthly snapshots

**Transactions (12 rows):** mix of IN/OUT with realistic Vietnamese descriptions (Salary, Rent, Utilities, Groceries, Freelance, etc.)

---

## File Structure

```
apps/web/src/
  pages/
    cash.page.tsx                  ← new page
  features/cash/
    components/
      cash-stat-cards.tsx          ← 3 stat cards
      cash-chart.tsx               ← balance over time chart
      cash-transaction-table.tsx   ← transactions table
      add-cash-transaction-modal.tsx ← placeholder modal
    data/
      fake-cash-data.ts            ← all static fake data
    index.ts                       ← public barrel
  components/
    side-nav.tsx                   ← add Cash nav link
  app/
    router.tsx                     ← add /cash route
```

---

## Design Tokens Used

- Surface: `bg-card`, `bg-muted`, `bg-background`
- Borders: `border-border`
- Text: `text-foreground`, `text-muted-foreground`
- Trading: `text-trading-up` (`#0ecb81`), `text-trading-down` (`#f6465d`)
- Primary CTA: `bg-[#fcd535] text-[#181a20]`
- Numbers: `font-number`

---

## Out of Scope

- API integration (no backend endpoints, no React Query hooks)
- Form fields in Add Transaction modal
- Filtering / sorting transactions
- Dark mode specific tweaks (inherits from existing theme)
