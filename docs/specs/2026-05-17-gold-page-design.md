# Gold Page — Design Spec

**Date:** 2026-05-17

## Overview

A new Gold tab in FinanceHub for tracking physical gold transactions (buy/sell). The page follows the same visual structure as the Cash page (header + stat cards + chart + transaction table) but with gold-specific metrics. Data is frontend-only (fake/static) for this iteration — no backend changes required.

---

## Layout

Matches the Cash page structure exactly:

```
[Header: "Gold"                          [+ Add Transaction]]
[5 stat cards in a single row            ]
[Value Over Time chart (1M / 6M / 1Y)   ]
[Transactions table                      ]
[Add Transaction modal (triggered by btn)]
```

---

## Stat Cards (5-column grid)

| #   | Label          | Value color               | Sub-label                          |
| --- | -------------- | ------------------------- | ---------------------------------- |
| 1   | Current Value  | neutral (foreground)      | `▲/▼ X% vs cost` (trading-up/down) |
| 2   | Total Invested | neutral                   | `original buy cost`                |
| 3   | Sell Revenue   | neutral                   | `all-time proceeds`                |
| 4   | Realized P&L   | trading-up / trading-down | `from closed positions`            |
| 5   | Total P&L      | trading-up / trading-down | `realized + unrealized`            |

**Computed from fake data:**

- **Current Value** = total weight still held × current price/g (static mock price)
- **Total Invested** = sum of all buy transactions (weight × price/g)
- **Sell Revenue** = sum of all sell transactions (weight × price/g)
- **Realized P&L** = sell revenue − cost basis of sold units
- **Total P&L** = Realized P&L + (Current Value − cost basis of unsold units)

---

## Chart

Reuses the same `CashChart` pattern: a Recharts `AreaChart` with a gold `#fcd535` stroke/fill, 1M/6M/1Y range toggle, and weekly/monthly labels. Static fake data per range.

---

## Transaction Table

Columns: **Date · Type · Weight (g) · Price/g (₫) · Total (₫)**

- Type: `Mua` (green `trading-up`) / `Bán` (red `trading-down`)
- Numbers use `font-number` utility class
- No delete action in this iteration (keeps scope tight; can be added later)

---

## Add Transaction Modal

Fields:

- **Date** — date picker
- **Type** — Mua / Bán toggle
- **Weight (g)** — number input
- **Price per gram (₫)** — number input
- **Total** — auto-computed read-only display (weight × price)

Form uses `react-hook-form` + `zod`. Submits to local fake state (no API call).

---

## Routing & Navigation

- Route: `/gold`
- Sidebar nav entry: `Gold` with a `Coins` icon (lucide-react), inserted between Cash and the bottom
- AppShell `NAV_LINKS` array updated

---

## File Structure

```
apps/web/src/
  features/gold/
    components/
      gold-stat-cards.tsx
      gold-chart.tsx
      gold-transaction-table.tsx
      add-gold-transaction-modal.tsx
    data/
      fake-gold-data.ts
    index.ts
  pages/
    gold.page.tsx
```

---

## Design Tokens

- Card background: `bg-card` / `border-border` (same as all other stat cards)
- P&L colors: `text-trading-up` (#0ecb81) / `text-trading-down` (#f6465d)
- Primary CTA: `bg-primary` (#fcd535) with `text-on-primary` (#181a20)
- Chart line/fill: `#fcd535`
- Numbers: `font-number` class on all numeric cells

---

## Out of Scope

- Backend API / Prisma schema changes
- Real market price feed
- Delete transaction action (can be added in a follow-up)
- Holdings/positions breakdown table (Gold is simpler than Stocks — single commodity)
