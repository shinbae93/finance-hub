# Stocks — Summary Tab Redesign

**Date:** 2026-05-17

## Goal

Merge the separate "Holdings" and "Summary" sub-nav items in the Stocks section into a single "Summary" tab that is the first item in the sub-navigation. The existing sidebar flyout UI (triggered by clicking "Stocks" in the main sidebar) is kept as-is.

## Sub-nav Order (after change)

1. **Summary** ← first, replaces the old standalone Holdings and Summary items
2. Transactions
3. Win / Loss

## Summary Tab Layout

### Top: Stat Cards (4 cards in a row)

| Card            | Value                              | Sub-text              |
| --------------- | ---------------------------------- | --------------------- |
| Portfolio Value | Total market value of all holdings | Day change in ₫       |
| Total P&L       | Absolute P&L in ₫                  | Percentage P&L        |
| Day Change      | Day change in ₫                    | Percentage day change |
| Positions       | Count of distinct stocks held      | "stocks held" label   |

- Up values use `trading-up` color (#0ecb81)
- Down values use `trading-down` color (#f6465d)
- All numeric values use `font-number` utility class

### Below: Holdings Table

Columns: Symbol · Avg Cost · Market Price · P&L (% + mini bar) · Value

- P&L column shows percentage and a small horizontal bar (width = % of best performer); green for positive, red for negative
- Rows sorted by portfolio value descending by default
- "Holdings" section title with a badge showing position count

## Routing

- The existing `/stocks` route remains; sub-navigation is handled client-side (tab/section state, not separate routes)
- Summary is the default active tab when navigating to `/stocks`

## Out of Scope

- No changes to Transactions or Win/Loss tabs
- No changes to the main sidebar or flyout trigger behavior
- No new API endpoints required (data comes from existing `/stocks/holdings` and `/stocks/summary` endpoints)
