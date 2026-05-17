# Design System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the finance-hub frontend to match the design system — dark-first theme, primary yellow primary, Inter + IBM Plex Mono fonts, token layer, persistent theme toggle in the top nav.

**Architecture:** CSS custom properties in `globals.css` map all design tokens; Tailwind `darkMode: 'class'` toggles them. A `ThemeProvider` context stores the active theme in `localStorage` and applies/removes the `dark` class on `<html>`. A new `AppShell` wraps all protected routes with a top nav that contains the theme toggle.

**Tech Stack:** React 19, Tailwind CSS (class-based dark mode), shadcn primitives (CVA), `@fontsource/inter`, `@fontsource/ibm-plex-mono`, `lucide-react`

**Branch:** `feat/update-design-system` (check it out before starting)

---

## File Map

| File                                                            | Action                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `libs/web-ui/src/styles/globals.css`                            | Replace all CSS tokens, add `.dark` block, import fonts        |
| `libs/web-ui/tailwind.preset.js`                                | Add `trading-up`, `trading-down` color tokens                  |
| `libs/web-ui/src/components/ui/button.tsx`                      | No change needed — tokens drive appearance                     |
| `libs/web-ui/src/components/ui/card.tsx`                        | Change `rounded-lg` → `rounded-xl`, remove `shadow-sm`         |
| `apps/web/src/lib/theme.tsx`                                    | Create `ThemeProvider` + `useTheme`                            |
| `apps/web/src/components/theme-toggle.tsx`                      | Create sun/moon icon toggle button                             |
| `apps/web/src/components/top-nav.tsx`                           | Create 64px top nav with wordmark, nav links, toggle, sign-out |
| `apps/web/src/components/app-shell.tsx`                         | Create layout shell wrapping TopNav + children                 |
| `apps/web/src/app/app.tsx`                                      | Wrap with `ThemeProvider`                                      |
| `apps/web/src/app/router.tsx`                                   | Wrap protected routes with `AppShell`                          |
| `apps/web/src/features/auth/components/auth-layout.tsx`         | Redesign with dark canvas + yellow CTA                         |
| `apps/web/src/pages/dashboard.page.tsx`                         | Remove inline header, use AppShell chrome                      |
| `apps/web/src/pages/stocks.page.tsx`                            | Upgrade sidebar chrome; yellow CTA                             |
| `apps/web/src/features/stocks/components/transaction-table.tsx` | `font-number` + trading colors on type/price cells             |
| `apps/web/src/features/stocks/components/win-loss-list.tsx`     | `font-number` + trading colors                                 |
| `apps/web/src/features/stocks/components/holdings-table.tsx`    | `font-number` on number cells                                  |
| `apps/web/src/features/stocks/components/summary-cards.tsx`     | `font-number` + trading colors                                 |

---

## Task 1: Checkout branch + install dependencies

**Files:**

- No source files changed — just git + package install

- [ ] **Step 1: Create and checkout the feature branch**

```bash
git checkout -b feat/update-design-system
```

Expected: `Switched to a new branch 'feat/update-design-system'`

- [ ] **Step 2: Install font packages and lucide-react**

```bash
pnpm add @fontsource/inter @fontsource/ibm-plex-mono lucide-react
```

Expected: packages appear in root `node_modules`, `package.json` updated.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add fontsource and lucide-react dependencies"
```

---

## Task 2: CSS token layer + fonts

**Files:**

- Modify: `libs/web-ui/src/styles/globals.css`

- [ ] **Step 1: Replace the entire file with design token mapping**

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 225 14% 10%;
    --card: 0 0% 100%;
    --card-foreground: 225 14% 10%;
    --primary: 46 97% 59%;
    --primary-foreground: 225 14% 10%;
    --muted: 0 0% 96%;
    --muted-foreground: 215 12% 47%;
    --border: 214 14% 90%;
    --input: 214 14% 90%;
    --ring: 46 97% 59%;
    --radius: 0.375rem;
    --destructive: 354 89% 62%;
    --destructive-foreground: 0 0% 100%;
  }

  .dark {
    --background: 228 14% 6%;
    --foreground: 216 18% 92%;
    --card: 226 14% 14%;
    --card-foreground: 0 0% 100%;
    --primary: 46 97% 59%;
    --primary-foreground: 225 14% 10%;
    --muted: 222 12% 18%;
    --muted-foreground: 215 12% 57%;
    --border: 222 12% 21%;
    --input: 222 12% 21%;
    --ring: 46 97% 59%;
    --destructive: 354 89% 62%;
    --destructive-foreground: 0 0% 100%;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }
}

@layer utilities {
  .font-number {
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-variant-numeric: tabular-nums;
  }

  .text-up {
    color: #0ecb81;
  }

  .text-down {
    color: #f6465d;
  }
}
```

- [ ] **Step 2: Verify Tailwind picks up the dark class config**

Open `libs/web-ui/tailwind.preset.js` and confirm `darkMode: 'class'` is present (it already is — just verify).

- [ ] **Step 3: Commit**

```bash
git add libs/web-ui/src/styles/globals.css
git commit -m "feat(design): replace CSS tokens with design system, add Inter + IBM Plex Mono fonts"
```

---

## Task 3: Add trading color tokens to Tailwind preset

**Files:**

- Modify: `libs/web-ui/tailwind.preset.js`

- [ ] **Step 1: Add `trading-up` and `trading-down` to the color palette**

In `libs/web-ui/tailwind.preset.js`, inside `theme.extend.colors`, add:

```js
'trading-up': '#0ecb81',
'trading-down': '#f6465d',
```

The full `theme.extend.colors` block should look like:

```js
colors: {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
  'trading-up': '#0ecb81',
  'trading-down': '#f6465d',
},
```

- [ ] **Step 2: Commit**

```bash
git add libs/web-ui/tailwind.preset.js
git commit -m "feat(design): add trading-up and trading-down Tailwind color tokens"
```

---

## Task 4: Update Card component

**Files:**

- Modify: `libs/web-ui/src/components/ui/card.tsx`

- [ ] **Step 1: Change Card border radius from `rounded-lg` to `rounded-xl` and remove `shadow-sm`**

Replace the `Card` component's className:

```tsx
// Before
className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}

// After
className={cn('rounded-xl border bg-card text-card-foreground', className)}
```

The full updated `card.tsx`:

```tsx
import * as React from 'react';
import { cn } from '../../lib/cn';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border bg-card text-card-foreground', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-lg font-semibold leading-none', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';
```

- [ ] **Step 2: Commit**

```bash
git add libs/web-ui/src/components/ui/card.tsx
git commit -m "feat(design): update Card to rounded-xl, remove shadow per design system"
```

---

## Task 5: ThemeProvider and useTheme hook

**Files:**

- Create: `apps/web/src/lib/theme.tsx`

- [ ] **Step 1: Create the theme context file**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap the app with ThemeProvider in `apps/web/src/app/app.tsx`**

```tsx
import { AppRoutes } from './router';
import { useAuthBootstrap } from '../features/auth/hooks/use-auth-bootstrap';
import { ThemeProvider } from '../lib/theme';

export function App(): JSX.Element {
  const ready = useAuthBootstrap();
  if (!ready) {
    return (
      <ThemeProvider>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/theme.tsx apps/web/src/app/app.tsx
git commit -m "feat(design): add ThemeProvider with localStorage persistence, default dark"
```

---

## Task 6: ThemeToggle component

**Files:**

- Create: `apps/web/src/components/theme-toggle.tsx`

- [ ] **Step 1: Create the toggle button**

```tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/theme-toggle.tsx
git commit -m "feat(design): add ThemeToggle sun/moon button"
```

---

## Task 7: TopNav component

**Files:**

- Create: `apps/web/src/components/top-nav.tsx`

- [ ] **Step 1: Create the top navigation bar**

```tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './theme-toggle';
import { useAuthStore } from '../features/auth/store/auth.store';
import { useLogout } from '../features/auth';

export function TopNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { mutate: logout, isPending } = useLogout();

  function navLinkClass(path: string): string {
    const active = location.pathname === path;
    return `text-sm font-medium transition-colors ${
      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`;
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-border bg-background px-6">
      {/* Wordmark */}
      <Link to="/dashboard" className="mr-8 text-lg font-semibold text-primary">
        FinanceHub
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-6">
        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
          Dashboard
        </Link>
        <Link to="/stocks" className={navLinkClass('/stocks')}>
          Stocks
        </Link>
      </nav>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {accessToken && (
          <button
            disabled={isPending}
            onClick={() => logout(undefined, { onSettled: () => navigate('/login') })}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {isPending ? 'Signing out…' : 'Sign out'}
          </button>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/top-nav.tsx
git commit -m "feat(design): add TopNav with wordmark, nav links, ThemeToggle, sign-out"
```

---

## Task 8: AppShell layout

**Files:**

- Create: `apps/web/src/components/app-shell.tsx`
- Modify: `apps/web/src/app/router.tsx`

- [ ] **Step 1: Create AppShell**

```tsx
import type { ReactNode } from 'react';
import { TopNav } from './top-nav';

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Wrap protected routes with AppShell in `apps/web/src/app/router.tsx`**

```tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';
import { StocksPage } from '../pages/stocks.page';
import { NotFoundPage } from '../pages/not-found.page';
import { ProtectedRoute } from '../features/auth/guards/protected-route';
import { AppShell } from '../components/app-shell';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stocks"
        element={
          <ProtectedRoute>
            <AppShell>
              <StocksPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/app-shell.tsx apps/web/src/app/router.tsx
git commit -m "feat(design): add AppShell layout, wire into router for all protected routes"
```

---

## Task 9: Redesign auth layout and pages

**Files:**

- Modify: `apps/web/src/features/auth/components/auth-layout.tsx`

- [ ] **Step 1: Replace AuthLayout with dark-canvas layout**

```tsx
import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <p className="mb-6 text-2xl font-semibold text-primary">FinanceHub</p>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <h1 className="mb-6 text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify login and register pages render correctly**

The `LoginPage` and `RegisterPage` components pass through to `AuthLayout` unchanged — no edits needed there. The yellow primary CTA comes automatically from the Button's `default` variant which maps to `bg-primary`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/auth/components/auth-layout.tsx
git commit -m "feat(design): redesign auth layout with dark canvas, yellow wordmark, card surface"
```

---

## Task 10: Redesign Dashboard page

**Files:**

- Modify: `apps/web/src/pages/dashboard.page.tsx`

- [ ] **Step 1: Remove inline header and sign-out button — AppShell handles them now**

```tsx
import { Link } from 'react-router-dom';
import { CurrentUserCard } from '../features/auth';

export function DashboardPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <CurrentUserCard />
      <nav className="flex gap-3">
        <Link
          to="/stocks"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Stocks →
        </Link>
      </nav>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/dashboard.page.tsx
git commit -m "feat(design): simplify Dashboard page — sign-out and nav moved to AppShell TopNav"
```

---

## Task 11: Redesign Stocks page chrome

**Files:**

- Modify: `apps/web/src/pages/stocks.page.tsx`

- [ ] **Step 1: Update sidebar and "Add Transaction" button styling**

Replace the entire `StocksPage` component:

```tsx
import { useState } from 'react';
import {
  useTransactions,
  useWinLoss,
  useHoldings,
  useSummary,
  TransactionTable,
  AddTransactionModal,
  WinLossList,
  HoldingsTable,
  SummaryCards,
} from '../features/stocks';
import { Button } from '@finance-hub/web-ui';

type Tab = 'transactions' | 'winloss' | 'holdings' | 'summary';

const TABS: { id: Tab; label: string }[] = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'winloss', label: 'Win / Loss' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'summary', label: 'Summary' },
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
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: transactions, isLoading: txLoading, isError: txError } = useTransactions();
  const { data: winLoss, isLoading: wlLoading, isError: wlError } = useWinLoss();
  const { data: holdings, isLoading: hLoading, isError: hError } = useHoldings();
  const { data: summary, isLoading: sLoading, isError: sError } = useSummary();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
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
                    ? 'border-r-2 border-primary bg-muted font-medium text-foreground'
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

        {activeTab === 'holdings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Holdings</h2>
            {hLoading ? (
              <Spinner />
            ) : hError ? (
              <QueryError message="Failed to load holdings. Please try again." />
            ) : holdings ? (
              <HoldingsTable data={holdings} />
            ) : null}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Summary</h2>
            {sLoading ? (
              <Spinner />
            ) : sError ? (
              <QueryError message="Failed to load summary. Please try again." />
            ) : summary ? (
              <SummaryCards data={summary} />
            ) : null}
          </div>
        )}
      </main>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/pages/stocks.page.tsx
git commit -m "feat(design): upgrade Stocks page sidebar chrome, yellow Add Transaction CTA"
```

---

## Task 12: Apply trading colors + font-number to TransactionTable

**Files:**

- Modify: `apps/web/src/features/stocks/components/transaction-table.tsx`

- [ ] **Step 1: Replace hardcoded green/red with `text-up`/`text-down` and add `font-number` to numeric cells**

Change the transaction type cell:

```tsx
// Before
className={tx.type === 'MUA' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}

// After
className={tx.type === 'MUA' ? 'text-up font-medium' : 'text-down font-medium'}
```

Change all numeric `<td>` cells (volume, price, fee, tax, total) to add `font-number`:

```tsx
// volume
<td className="px-3 py-2 text-right font-number">{formatNumber(tx.volume)}</td>

// price
<td className="px-3 py-2 text-right font-number">{formatNumber(tx.price)}</td>

// fee
<td className="px-3 py-2 text-right font-number text-muted-foreground">{formatNumber(tx.fee)}</td>

// tax
<td className="px-3 py-2 text-right font-number text-muted-foreground">{formatNumber(tx.tax)}</td>

// total
<td className="px-3 py-2 text-right font-number font-medium">{formatNumber(tx.totalAmount)}</td>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/stocks/components/transaction-table.tsx
git commit -m "feat(design): apply font-number and trading colors to TransactionTable"
```

---

## Task 13: Apply trading colors + font-number to WinLossList

**Files:**

- Modify: `apps/web/src/features/stocks/components/win-loss-list.tsx`

- [ ] **Step 1: Replace `text-green-500` / `text-red-500` with `text-up` / `text-down`, add `font-number` to number cells**

Replace all occurrences of `text-green-500` with `text-up` and `text-red-500` with `text-down`:

```tsx
// Group header total PnL
className={group.totalPnl >= 0 ? 'text-up font-medium' : 'text-down font-medium'}

// Sell row PnL cell
className={`text-right font-medium font-number ${sell.pnl >= 0 ? 'text-up' : 'text-down'}`}

// Sell row return % cell
className={`text-right font-number ${sell.returnPct >= 0 ? 'text-up' : 'text-down'}`}

// Win rate summary card
className={`text-2xl font-bold font-number ${data.winRate >= 50 ? 'text-up' : 'text-down'}`}

// Total realized PnL summary card
className={`text-2xl font-bold font-number ${data.totalPnl >= 0 ? 'text-up' : 'text-down'}`}
```

Also add `font-number` to volume, sell price, avg cost cells:

```tsx
<span className="text-right font-number">{formatNum(sell.volume)}</span>
<span className="text-right font-number">{formatNum(sell.sellPrice)}</span>
<span className="text-right font-number">{formatNum(sell.avgCost)}</span>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/stocks/components/win-loss-list.tsx
git commit -m "feat(design): apply font-number and trading colors to WinLossList"
```

---

## Task 14: Apply font-number to HoldingsTable

**Files:**

- Modify: `apps/web/src/features/stocks/components/holdings-table.tsx`

- [ ] **Step 1: Add `font-number` to all numeric table cells**

```tsx
// shares
<td className="px-4 py-2 text-right font-number">{formatNum(h.shares)}</td>

// avg cost
<td className="px-4 py-2 text-right font-number">{formatNum(h.avgCost)}</td>

// total invested
<td className="px-4 py-2 text-right font-number">{formatNum(h.totalInvested)}</td>

// total fees
<td className="px-4 py-2 text-right font-number text-muted-foreground">{formatNum(h.totalFeesPaid)}</td>

// footer totals — also font-number
<td className="px-4 py-2 text-right font-number text-primary">{formatNum(data.totalInvested)}</td>
<td className="px-4 py-2 text-right font-number text-primary">{formatNum(data.totalFeesPaid)}</td>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/stocks/components/holdings-table.tsx
git commit -m "feat(design): apply font-number to HoldingsTable numeric cells"
```

---

## Task 15: Apply trading colors + font-number to SummaryCards

**Files:**

- Modify: `apps/web/src/features/stocks/components/summary-cards.tsx`

- [ ] **Step 1: Update StatCard to use trading tokens and font-number**

Replace the `positive` color logic in `StatCard`:

```tsx
// Before
className={`text-xl font-bold ${positive === true ? 'text-green-500' : positive === false ? 'text-red-500' : ''}`}

// After
className={`text-xl font-bold font-number ${positive === true ? 'text-up' : positive === false ? 'text-down' : 'text-foreground'}`}
```

Add `font-number` to the by-ticker table number cells:

```tsx
// invested
<td className="px-4 py-2 text-right font-number">{formatNum(t.totalInvested)}</td>

// received
<td className="px-4 py-2 text-right font-number">
  {t.totalReceived > 0 ? formatNum(t.totalReceived) : '—'}
</td>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/stocks/components/summary-cards.tsx
git commit -m "feat(design): apply font-number and trading colors to SummaryCards"
```

---

## Task 16: Smoke test the full UI

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

Open `http://localhost:4200`.

- [ ] **Step 2: Verify dark mode default**

On first load (or after clearing `localStorage`), the app should display with dark canvas (`#0b0e11`), white text, and yellow "FinanceHub" wordmark. The `<html>` element should have the `dark` class.

- [ ] **Step 3: Verify theme toggle**

Click the sun icon in the top nav. The page should switch to light canvas (`#ffffff`). The icon should become a moon. Refreshing the page should persist the light theme.

- [ ] **Step 4: Verify auth pages**

Navigate to `/login`. The page should show dark canvas, yellow "FinanceHub" wordmark above a card, and a yellow "Sign in" button.

- [ ] **Step 5: Verify Stocks page**

Log in and navigate to `/stocks`. Verify:

- Sidebar has dark card surface (`#1e2329` in dark mode)
- Active tab has yellow right border
- "Add Transaction" button is yellow
- Number cells use IBM Plex Mono (tabular, monospace appearance)
- MUA transactions show in green (`#0ecb81`), BÁN in red (`#f6465d`)

- [ ] **Step 6: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 7: Run lint**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 8: Final commit if any fixes needed, then push branch**

```bash
git push -u origin feat/update-design-system
```
