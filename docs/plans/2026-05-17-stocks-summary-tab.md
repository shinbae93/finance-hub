# Stocks Summary Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the Holdings and Summary sub-nav items into a single "Summary" tab that is first in the Stocks sub-navigation, combining stat cards and a holdings table on one page.

**Architecture:** The `StocksPage` component owns the tab state. We replace the four-item `TABS` array (transactions, winloss, holdings, summary) with a three-item array (summary, transactions, winloss), then build a new `SummaryTab` component that renders stat cards from `useSummary` and the holdings table from `useHoldings` together. The existing `SummaryCards` and `HoldingsTable` components are replaced by the new `SummaryTab`; their exports are removed from the barrel.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, `@tanstack/react-query`, `@finance-hub/shared-api-types`, `@finance-hub/web-ui`

---

## File Map

| Action | Path                                                         | Purpose                                                             |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Create | `apps/web/src/features/stocks/components/summary-tab.tsx`    | New merged component: stat cards + holdings table                   |
| Modify | `apps/web/src/pages/stocks.page.tsx`                         | Reorder tabs, remove holdings tab, wire `SummaryTab`                |
| Modify | `apps/web/src/features/stocks/index.ts`                      | Export `SummaryTab`; remove `HoldingsTable`, `SummaryCards` exports |
| Delete | `apps/web/src/features/stocks/components/holdings-table.tsx` | No longer needed separately                                         |
| Delete | `apps/web/src/features/stocks/components/summary-cards.tsx`  | No longer needed separately                                         |

---

## Task 1: Create `SummaryTab` component

**Files:**

- Create: `apps/web/src/features/stocks/components/summary-tab.tsx`

This component receives both `HoldingsDto` and `SummaryDto` as props and renders:

1. A row of 4 stat cards (Total Invested, Total Received, Realized P&L, Net Cash Position)
2. A "Holdings" section with a table (Ticker, Shares, Avg Cost, Total Invested, Fees)

- [ ] **Step 1: Create the file**

```tsx
// apps/web/src/features/stocks/components/summary-tab.tsx
import type { HoldingsDto, SummaryDto } from '@finance-hub/shared-api-types';
import { formatNum, formatPnl } from '../utils/format';

interface Props {
  holdings: HoldingsDto;
  summary: SummaryDto;
}

function StatCard({
  label,
  value,
  sub,
  sentiment,
}: {
  label: string;
  value: string;
  sub?: string;
  sentiment?: 'up' | 'down' | 'neutral';
}) {
  const valueClass =
    sentiment === 'up'
      ? 'text-trading-up'
      : sentiment === 'down'
        ? 'text-trading-down'
        : 'text-foreground';
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-1 text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`font-number text-xl font-bold ${valueClass}`}>{value} ₫</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function SummaryTab({ holdings, summary }: Props): JSX.Element {
  const pnlSentiment: 'up' | 'down' | 'neutral' =
    summary.realizedPnl > 0 ? 'up' : summary.realizedPnl < 0 ? 'down' : 'neutral';
  const netSentiment: 'up' | 'down' | 'neutral' =
    summary.netCashPosition > 0 ? 'up' : summary.netCashPosition < 0 ? 'down' : 'neutral';

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Invested"
          value={formatNum(summary.totalInvested)}
          sub="across all buys"
        />
        <StatCard
          label="Total Received"
          value={formatNum(summary.totalReceived)}
          sub="from all sells"
        />
        <StatCard
          label="Realized P&L"
          value={formatPnl(summary.realizedPnl)}
          sub="after fees & tax"
          sentiment={pnlSentiment}
        />
        <StatCard
          label="Net Cash Position"
          value={formatPnl(summary.netCashPosition)}
          sub="received − invested"
          sentiment={netSentiment}
        />
      </div>

      {/* Holdings table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Holdings</h3>
          <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {holdings.holdings.length} position{holdings.holdings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {holdings.holdings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No current holdings.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Ticker</th>
                  <th className="px-4 py-2 text-right">Shares</th>
                  <th className="px-4 py-2 text-right">Avg Cost (₫)</th>
                  <th className="px-4 py-2 text-right">Total Invested (₫)</th>
                  <th className="px-4 py-2 text-right">Fees (₫)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {holdings.holdings.map((h) => (
                  <tr key={h.ticker} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-2 font-semibold">{h.ticker}</td>
                    <td className="px-4 py-2 text-right font-number">{formatNum(h.shares)}</td>
                    <td className="px-4 py-2 text-right font-number">{formatNum(h.avgCost)}</td>
                    <td className="px-4 py-2 text-right font-number">
                      {formatNum(h.totalInvested)}
                    </td>
                    <td className="px-4 py-2 text-right font-number text-muted-foreground">
                      {formatNum(h.totalFeesPaid)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-muted font-semibold">
                <tr>
                  <td className="px-4 py-2" colSpan={3}>
                    Total
                  </td>
                  <td className="px-4 py-2 text-right font-number text-primary">
                    {formatNum(holdings.totalInvested)}
                  </td>
                  <td className="px-4 py-2 text-right font-number text-primary">
                    {formatNum(holdings.totalFeesPaid)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors (the file just defines types and uses existing utilities).

---

## Task 2: Update the barrel export

**Files:**

- Modify: `apps/web/src/features/stocks/index.ts`

Remove the `HoldingsTable` and `SummaryCards` exports; add `SummaryTab`.

- [ ] **Step 1: Replace the component exports**

Open `apps/web/src/features/stocks/index.ts`. The current component export lines are:

```ts
export { TransactionTable } from './components/transaction-table';
export { AddTransactionModal } from './components/add-transaction-modal';
export { WinLossList } from './components/win-loss-list';
export { HoldingsTable } from './components/holdings-table';
export { SummaryCards } from './components/summary-cards';
```

Replace with:

```ts
export { TransactionTable } from './components/transaction-table';
export { AddTransactionModal } from './components/add-transaction-modal';
export { WinLossList } from './components/win-loss-list';
export { SummaryTab } from './components/summary-tab';
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: errors about `HoldingsTable` and `SummaryCards` being used in `stocks.page.tsx` — that's expected; we'll fix them in Task 3.

---

## Task 3: Rewrite `StocksPage`

**Files:**

- Modify: `apps/web/src/pages/stocks.page.tsx`

Reorder tabs to `summary → transactions → winloss`, remove the separate `holdings` tab, and wire `SummaryTab` as the default view.

- [ ] **Step 1: Replace the full file content**

```tsx
// apps/web/src/pages/stocks.page.tsx
import { useState } from 'react';
import {
  useTransactions,
  useWinLoss,
  useHoldings,
  useSummary,
  TransactionTable,
  AddTransactionModal,
  WinLossList,
  SummaryTab,
} from '../features/stocks';
import { Button } from '@finance-hub/web-ui';

type Tab = 'summary' | 'transactions' | 'winloss';

const TABS: { id: Tab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'winloss', label: 'Win / Loss' },
];

function Spinner(): JSX.Element {
  return (
    <div className="flex justify-center py-12">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function QueryError({ message }: { message: string }): JSX.Element {
  return <p className="py-8 text-center text-sm text-destructive">{message}</p>;
}

export function StocksPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: transactions, isLoading: txLoading, isError: txError } = useTransactions();
  const { data: winLoss, isLoading: wlLoading, isError: wlError } = useWinLoss();
  const { data: holdings, isLoading: hLoading, isError: hError } = useHoldings();
  const { data: summary, isLoading: sLoading, isError: sError } = useSummary();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sub-nav sidebar */}
      <nav className="w-40 flex-shrink-0 border-r border-border bg-card">
        <div className="px-4 py-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Stocks
        </div>
        <ul>
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-r-2 border-primary bg-muted font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto bg-background p-6">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            {hLoading || sLoading ? (
              <Spinner />
            ) : hError || sError ? (
              <QueryError message="Failed to load summary. Please try again." />
            ) : holdings && summary ? (
              <SummaryTab holdings={holdings} summary={summary} />
            ) : null}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
              <Button onClick={() => setModalOpen(true)}>+ Add Transaction</Button>
            </div>
            {txLoading ? (
              <Spinner />
            ) : txError ? (
              <QueryError message="Failed to load transactions. Please try again." />
            ) : (
              <TransactionTable transactions={transactions ?? []} />
            )}
          </div>
        )}

        {activeTab === 'winloss' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Win / Loss</h2>
            {wlLoading ? (
              <Spinner />
            ) : wlError ? (
              <QueryError message="Failed to load win/loss data. Please try again." />
            ) : winLoss ? (
              <WinLossList data={winLoss} />
            ) : null}
          </div>
        )}
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: zero errors.

---

## Task 4: Delete the now-unused component files

**Files:**

- Delete: `apps/web/src/features/stocks/components/holdings-table.tsx`
- Delete: `apps/web/src/features/stocks/components/summary-cards.tsx`

- [ ] **Step 1: Delete both files**

```bash
rm apps/web/src/features/stocks/components/holdings-table.tsx
rm apps/web/src/features/stocks/components/summary-cards.tsx
```

- [ ] **Step 2: Typecheck and lint to confirm nothing references them**

```bash
pnpm typecheck && pnpm lint
```

Expected: zero errors.

---

## Task 5: Verify in the browser and commit

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev:web
```

- [ ] **Step 2: Open http://localhost:4200 and navigate to /stocks**

Verify:

- Sub-nav shows: **Summary** (active by default) · Transactions · Win / Loss
- Summary tab shows 4 stat cards followed by the holdings table
- Transactions tab still works and "+ Add Transaction" button opens the modal
- Win / Loss tab still works
- Collapsed sidebar still works

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/stocks/components/summary-tab.tsx \
        apps/web/src/features/stocks/index.ts \
        apps/web/src/pages/stocks.page.tsx
git rm apps/web/src/features/stocks/components/holdings-table.tsx \
       apps/web/src/features/stocks/components/summary-cards.tsx
git commit -m "feat: merge holdings and summary into first Summary tab"
```
