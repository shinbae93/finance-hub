# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top-nav shell with a collapsible left sidebar and build out the dashboard page with total wealth, allocation donut, asset history area chart, and recent transactions.

**Architecture:** Incremental — shell layout first (Task 1–2), then dashboard widgets (Task 3–7). `AppShell` switches from `flex-col` to `flex-row`, `TopNav` is deleted and replaced by `SideNav`. Dashboard widgets live in a new `features/dashboard/` feature folder following the existing feature structure. All dashboard data is hardcoded placeholder values in this phase.

**Tech Stack:** React 19, Vite, Tailwind CSS, lucide-react (icons), recharts (charts), react-router-dom v6, zustand (auth store), existing design tokens from `libs/web-ui`.

---

## Task 1: Install recharts

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 1: Install recharts**

```bash
pnpm add recharts
```

Expected output: recharts added to `dependencies` in `package.json`. No errors.

- [ ] **Step 2: Verify TypeScript types are available**

Recharts v2 ships its own types — no `@types/recharts` needed. Verify:

```bash
pnpm typecheck
```

Expected: zero errors (no new errors introduced).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add recharts dependency"
```

---

## Task 2: Build SideNav and update AppShell

**Files:**

- Create: `apps/web/src/components/side-nav.tsx`
- Modify: `apps/web/src/components/app-shell.tsx`
- Delete: `apps/web/src/components/top-nav.tsx`

### Context

The current `AppShell` renders `<TopNav />` above `<main>`. After this task it renders `<SideNav />` beside `<main>` in a `flex-row` container. The `TopNav` component is deleted.

`SideNav` uses:

- `useLocation` from `react-router-dom` for active route detection
- `useNavigate` from `react-router-dom` for post-logout redirect
- `useLogout` from `features/auth` (import from barrel `../features/auth`)
- `useAuthStore` from `features/auth` (import from barrel)
- `useTheme` from `../lib/theme` for the theme toggle
- `localStorage` key `sidebar-collapsed` to persist collapse state
- Icons from `lucide-react`: `LayoutDashboard`, `TrendingUp`, `ChevronLeft`, `ChevronRight`, `Sun`, `Moon`, `LogOut`

Design tokens (use these Tailwind classes — they are defined in `libs/web-ui`):

- Sidebar background: `bg-[#1e2329]` (surface-card-dark)
- Active nav item: `bg-[#fcd535] text-[#181a20] font-semibold`
- Inactive nav item: `text-[#707a8a] hover:text-foreground hover:bg-[#2b3139]`
- Border: `border-r border-[#2b3139]`
- Muted text: `text-[#707a8a]`
- Body text: `text-[#eaecef]`

- [ ] **Step 1: Create `apps/web/src/components/side-nav.tsx`**

```tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore, useLogout } from '../features/auth';
import { useTheme } from '../lib/theme';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks', Icon: TrendingUp },
];

export function SideNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();
  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  }

  const avatarInitial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <aside
      className={`flex h-screen flex-col border-r border-[#2b3139] bg-[#1e2329] transition-all duration-200 ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      } sticky top-0 flex-shrink-0`}
    >
      {/* Wordmark / Monogram */}
      <div className="flex h-16 items-center border-b border-[#2b3139] px-4">
        {collapsed ? (
          <span className="text-sm font-bold text-[#fcd535]">FH</span>
        ) : (
          <Link to="/dashboard" className="text-base font-bold text-[#fcd535]">
            FinanceHub
          </Link>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_LINKS.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-[#fcd535] font-semibold text-[#181a20]'
                  : 'text-[#707a8a] hover:bg-[#2b3139] hover:text-[#eaecef]'
              } ${collapsed ? 'flex-col gap-1 px-2 py-3' : ''}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {collapsed ? (
                <span className="text-[10px] leading-none">{label}</span>
              ) : (
                <span>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user info + controls */}
      <div className="flex flex-col gap-2 border-t border-[#2b3139] p-3">
        {/* User info (expanded only) */}
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-[#181a20]">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#eaecef]">{user.name}</p>
              <p className="truncate text-[10px] text-[#707a8a]">{user.email}</p>
            </div>
          </div>
        )}

        {/* Avatar only (collapsed) */}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535] text-xs font-bold text-[#181a20]">
              {avatarInitial}
            </div>
          </div>
        )}

        {/* Controls row */}
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Sign out */}
          <button
            disabled={isPending}
            onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
            aria-label="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef] disabled:opacity-50"
          >
            <LogOut size={15} />
          </button>

          {/* Collapse toggle (only in expanded row) */}
          {!collapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {/* Expand button (collapsed state only) */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
            className="flex h-8 w-8 items-center justify-center self-center rounded-md text-[#707a8a] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Update `apps/web/src/components/app-shell.tsx`**

Replace the entire file:

```tsx
import type { ReactNode } from 'react';
import { SideNav } from './side-nav';

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Delete `apps/web/src/components/top-nav.tsx`**

```bash
rm apps/web/src/components/top-nav.tsx
```

- [ ] **Step 4: Typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: zero errors. If `top-nav` is imported anywhere else, remove those imports.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/side-nav.tsx apps/web/src/components/app-shell.tsx
git rm apps/web/src/components/top-nav.tsx
git commit -m "feat: replace top-nav with collapsible left sidebar"
```

---

## Task 3: Create dashboard feature barrel and WealthCard

**Files:**

- Create: `apps/web/src/features/dashboard/components/wealth-card.tsx`
- Create: `apps/web/src/features/dashboard/index.ts`

- [ ] **Step 1: Create `apps/web/src/features/dashboard/components/wealth-card.tsx`**

```tsx
export function WealthCard(): JSX.Element {
  return (
    <div className="rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#707a8a]">
        Total Wealth
      </p>
      <div className="flex items-end gap-3">
        <span className="font-number text-3xl font-bold text-[#fcd535]">₫1,240,000,000</span>
        <span className="mb-1 text-sm text-[#0ecb81]">▲ +2.4% this month</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `apps/web/src/features/dashboard/index.ts`**

```ts
export { WealthCard } from './components/wealth-card';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/dashboard/
git commit -m "feat: add dashboard feature with WealthCard"
```

---

## Task 4: Build AllocationChart (Recharts donut)

**Files:**

- Create: `apps/web/src/features/dashboard/components/allocation-chart.tsx`
- Modify: `apps/web/src/features/dashboard/index.ts`

### Context

Uses Recharts `PieChart` + `Pie` with `innerRadius` to create a donut. The legend is rendered manually (not Recharts `Legend` component) to match the design system. Category data is hardcoded.

- [ ] **Step 1: Create `apps/web/src/features/dashboard/components/allocation-chart.tsx`**

```tsx
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const ALLOCATION_DATA = [
  { name: 'Stocks', value: 45, color: '#fcd535' },
  { name: 'Cash', value: 25, color: '#0ecb81' },
  { name: 'Gold', value: 15, color: '#2dbdb6' },
  { name: 'Other', value: 15, color: '#3b82f6' },
];

export function AllocationChart(): JSX.Element {
  return (
    <div className="w-[220px] flex-shrink-0 rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#929aa5]">Allocation</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={80} height={80}>
          <PieChart>
            <Pie
              data={ALLOCATION_DATA}
              cx="50%"
              cy="50%"
              innerRadius={24}
              outerRadius={38}
              dataKey="value"
              strokeWidth={0}
            >
              {ALLOCATION_DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <ul className="flex flex-col gap-1.5">
          {ALLOCATION_DATA.map((entry) => (
            <li key={entry.name} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-sm"
                style={{ background: entry.color }}
              />
              <span className="text-[#eaecef]">{entry.name}</span>
              <span className="ml-1 font-number font-semibold" style={{ color: entry.color }}>
                {entry.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Export from barrel — update `apps/web/src/features/dashboard/index.ts`**

```ts
export { WealthCard } from './components/wealth-card';
export { AllocationChart } from './components/allocation-chart';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/dashboard/
git commit -m "feat: add AllocationChart donut widget"
```

---

## Task 5: Build AssetHistoryChart (Recharts area chart)

**Files:**

- Create: `apps/web/src/features/dashboard/components/asset-history-chart.tsx`
- Modify: `apps/web/src/features/dashboard/index.ts`

### Context

Uses Recharts `AreaChart` wrapped in `ResponsiveContainer`. Gradient fill defined via SVG `<defs>`. Three time-range buttons (1M / 6M / 1Y) each show different hardcoded datasets. `YAxis` is hidden. Tooltip uses a custom dark-styled renderer.

- [ ] **Step 1: Create `apps/web/src/features/dashboard/components/asset-history-chart.tsx`**

```tsx
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  type TooltipProps,
} from 'recharts';

type Range = '1M' | '6M' | '1Y';

const DATA: Record<Range, { month: string; value: number }[]> = {
  '1M': [
    { month: 'W1', value: 1100 },
    { month: 'W2', value: 1130 },
    { month: 'W3', value: 1120 },
    { month: 'W4', value: 1170 },
    { month: 'W5', value: 1155 },
    { month: 'Now', value: 1240 },
  ],
  '6M': [
    { month: 'Jan', value: 900 },
    { month: 'Feb', value: 960 },
    { month: 'Mar', value: 920 },
    { month: 'Apr', value: 1050 },
    { month: 'May', value: 1100 },
    { month: 'Now', value: 1240 },
  ],
  '1Y': [
    { month: 'Jun', value: 700 },
    { month: 'Aug', value: 780 },
    { month: 'Oct', value: 850 },
    { month: 'Dec', value: 920 },
    { month: 'Mar', value: 1050 },
    { month: 'Now', value: 1240 },
  ],
};

const RANGES: Range[] = ['1M', '6M', '1Y'];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#2b3139] bg-[#2b3139] px-3 py-2 text-xs">
      <p className="text-[#929aa5]">{label}</p>
      <p className="font-number font-semibold text-[#eaecef]">
        ₫{((payload[0].value ?? 0) * 1_000_000).toLocaleString('vi-VN')}
      </p>
    </div>
  );
}

export function AssetHistoryChart(): JSX.Element {
  const [range, setRange] = useState<Range>('6M');
  const data = DATA[range];

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[#929aa5]">
          Total Assets Over Time
        </p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[#fcd535] text-[#181a20]'
                  : 'bg-[#2b3139] text-[#eaecef] hover:bg-[#353d47]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="assetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fcd535" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#fcd535" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2b3139" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#707a8a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#fcd535"
              strokeWidth={1.5}
              fill="url(#assetGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#fcd535', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Export from barrel — update `apps/web/src/features/dashboard/index.ts`**

```ts
export { WealthCard } from './components/wealth-card';
export { AllocationChart } from './components/allocation-chart';
export { AssetHistoryChart } from './components/asset-history-chart';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/dashboard/
git commit -m "feat: add AssetHistoryChart area chart widget"
```

---

## Task 6: Build RecentTransactions table

**Files:**

- Create: `apps/web/src/features/dashboard/components/recent-transactions.tsx`
- Modify: `apps/web/src/features/dashboard/index.ts`

- [ ] **Step 1: Create `apps/web/src/features/dashboard/components/recent-transactions.tsx`**

```tsx
import { Link } from 'react-router-dom';

type TxType = 'MUA' | 'BAN';

interface Transaction {
  id: string;
  date: string;
  stock: string;
  type: TxType;
  qty: number;
  value: number;
}

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '17 May', stock: 'VNM', type: 'MUA', qty: 500, value: 12_400_000 },
  { id: '2', date: '15 May', stock: 'HPG', type: 'BAN', qty: 300, value: -8_200_000 },
  { id: '3', date: '12 May', stock: 'FPT', type: 'MUA', qty: 200, value: 18_600_000 },
  { id: '4', date: '10 May', stock: 'VIC', type: 'BAN', qty: 150, value: -5_100_000 },
  { id: '5', date: '08 May', stock: 'MWG', type: 'MUA', qty: 400, value: 9_800_000 },
];

function formatValue(value: number): string {
  const abs = Math.abs(value).toLocaleString('vi-VN');
  return value >= 0 ? `+₫${abs}` : `-₫${abs}`;
}

export function RecentTransactions(): JSX.Element {
  return (
    <div className="rounded-xl border border-[#2b3139] bg-[#1e2329] p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[#929aa5]">
          Recent Transactions
        </p>
        <Link to="/stocks" className="text-xs text-[#fcd535] hover:underline">
          View all →
        </Link>
      </div>

      <div className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_64px_64px_100px] gap-2 border-b border-[#2b3139] pb-2 text-[10px] uppercase tracking-wider text-[#707a8a]">
          <span>Date</span>
          <span>Stock</span>
          <span>Type</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Value</span>
        </div>

        {/* Rows */}
        {RECENT_TRANSACTIONS.map((tx, i) => (
          <div
            key={tx.id}
            className={`grid grid-cols-[80px_1fr_64px_64px_100px] items-center gap-2 py-2.5 text-sm ${
              i < RECENT_TRANSACTIONS.length - 1 ? 'border-b border-[#2b3139]' : ''
            }`}
          >
            <span className="text-xs text-[#707a8a]">{tx.date}</span>
            <span className="font-semibold text-[#eaecef]">{tx.stock}</span>
            <span
              className={`text-xs font-semibold ${
                tx.type === 'MUA' ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              {tx.type}
            </span>
            <span className="font-number text-right text-[#eaecef]">{tx.qty}</span>
            <span
              className={`font-number text-right text-xs ${
                tx.value >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              {formatValue(tx.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Export from barrel — update `apps/web/src/features/dashboard/index.ts`**

```ts
export { WealthCard } from './components/wealth-card';
export { AllocationChart } from './components/allocation-chart';
export { AssetHistoryChart } from './components/asset-history-chart';
export { RecentTransactions } from './components/recent-transactions';
```

- [ ] **Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/dashboard/
git commit -m "feat: add RecentTransactions widget"
```

---

## Task 7: Wire everything into DashboardPage

**Files:**

- Modify: `apps/web/src/pages/dashboard.page.tsx`

- [ ] **Step 1: Replace `apps/web/src/pages/dashboard.page.tsx`**

```tsx
import {
  AllocationChart,
  AssetHistoryChart,
  RecentTransactions,
  WealthCard,
} from '../features/dashboard';

export function DashboardPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#eaecef]">Dashboard</h1>
      </div>

      {/* Total Wealth */}
      <WealthCard />

      {/* Middle row: allocation + chart */}
      <div className="flex gap-5">
        <AllocationChart />
        <AssetHistoryChart />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: zero errors.

- [ ] **Step 3: Start dev server and visually verify**

```bash
pnpm dev:web
```

Open `http://localhost:4200`. Check:

- Sidebar appears on the left, full-width by default
- Collapse button shrinks sidebar to icon+label compact mode; state persists on refresh
- Dashboard shows all 4 sections stacked correctly
- Donut chart renders with 4 colored segments
- Area chart renders with gradient fill and time-range buttons switch datasets
- Recent transactions table shows 5 rows with correct MUA/BAN coloring

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/pages/dashboard.page.tsx
git commit -m "feat: wire dashboard widgets into DashboardPage"
```

---

## Task 8: Final typecheck, lint, and cleanup

- [ ] **Step 1: Run full checks**

```bash
pnpm typecheck && pnpm lint
```

Expected: zero errors, zero warnings.

- [ ] **Step 2: Verify no stale TopNav imports remain**

```bash
grep -r "top-nav\|TopNav" apps/web/src/
```

Expected: no results.

- [ ] **Step 3: Final commit if any cleanup was needed**

```bash
git add -p
git commit -m "chore: remove stale TopNav references"
```

Only commit if there were stale references to clean up — skip otherwise.
