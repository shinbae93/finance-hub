# Design System Redesign

**Date:** 2026-05-17  
**Branch:** `feat/update-design-system`  
**Scope:** Full frontend redesign — token layer, theme system, layout structure, typography, component upgrades

---

## Overview

Restyle the finance-hub frontend to match the design system documented in `DESIGN.md`. Default theme is dark. A theme toggle in the top nav allows switching to light mode for comparison. No backend changes. All existing features (auth, stocks) remain functionally identical.

---

## 1. Token Layer

Replace the existing `:root` CSS vars in `libs/web-ui/src/styles/globals.css` with design tokens. Add a `.dark` block.

### Light mode (`:root`)

```css
--background: 0 0% 100%; /* canvas-light #ffffff */
--foreground: 225 14% 10%; /* ink #181a20 */
--card: 0 0% 100%; /* canvas-light */
--card-foreground: 225 14% 10%;
--primary: 46 97% 59%; /* primary yellow #fcd535 */
--primary-foreground: 225 14% 10%; /* on-primary #181a20 */
--muted: 0 0% 96%; /* surface-strong-light #f5f5f5 */
--muted-foreground: 215 12% 47%; /* muted #707a8a */
--border: 214 14% 90%; /* hairline-on-light #eaecef */
--input: 214 14% 90%;
--ring: 46 97% 59%; /* yellow focus ring */
--radius: 0.375rem; /* 6px — rounded.md */
--destructive: 354 89% 62%; /* trading-down #f6465d */
--destructive-foreground: 0 0% 100%;
```

### Dark mode (`.dark`)

```css
--background: 228 14% 6%; /* canvas-dark #0b0e11 */
--foreground: 216 18% 92%; /* body on dark #eaecef */
--card: 226 14% 14%; /* surface-card-dark #1e2329 */
--card-foreground: 0 0% 100%;
--primary: 46 97% 59%; /* yellow unchanged */
--primary-foreground: 225 14% 10%;
--muted: 222 12% 18%; /* surface-elevated-dark #2b3139 */
--muted-foreground: 215 12% 57%; /* muted-strong #929aa5 */
--border: 222 12% 21%; /* hairline-on-dark #2b3139 */
--input: 222 12% 21%;
--ring: 46 97% 59%;
--destructive: 354 89% 62%;
--destructive-foreground: 0 0% 100%;
```

### New Tailwind colors (in `tailwind.preset.js`)

```js
'trading-up': '#0ecb81',
'trading-down': '#f6465d',
'surface-elevated': 'hsl(var(--muted))',
```

---

## 2. Typography

**Fonts:** `@fontsource/inter` (body/display) + `@fontsource/ibm-plex-mono` (numbers).  
Installed as npm packages. Imported in `globals.css`.

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
```

`@layer base { body { font-family: 'Inter', -apple-system, sans-serif; } }`

**Utility classes** added to `globals.css`:

- `.font-number` — `font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums;`
- `.text-up` — `color: #0ecb81`
- `.text-down` — `color: #f6465d`

---

## 3. Theme System

**File:** `apps/web/src/lib/theme.tsx`

- `ThemeContext` holds `theme: 'dark' | 'light'` and `toggleTheme()`.
- On mount: reads `localStorage.getItem('theme')`, defaults to `'dark'`.
- Applies/removes the `dark` class on `document.documentElement`.
- Persists choice to `localStorage` on toggle.
- `ThemeProvider` wraps the app in `app.tsx`.
- `useTheme()` hook exported for consumers.

---

## 4. Layout Structure

### TopNav (`apps/web/src/components/top-nav.tsx`)

- Height: 64px, `bg-background border-b border-border`
- **Left:** "FinanceHub" wordmark — `text-primary font-semibold text-lg`
- **Center:** nav links — Dashboard (`/dashboard`), Stocks (`/stocks`) — `text-sm font-medium text-muted-foreground hover:text-foreground`; active link gets `text-foreground`
- **Right:** `ThemeToggle` + sign-out button (`button-secondary` style) — only shown when authenticated
- TopNav is rendered inside a new `AppShell` layout that wraps all protected routes

### ThemeToggle (`apps/web/src/components/theme-toggle.tsx`)

- Icon button: sun icon in dark mode, moon icon in light mode (lucide-react icons, already available)
- `aria-label="Toggle theme"`
- Calls `toggleTheme()` from `useTheme()`

### AppShell (`apps/web/src/components/app-shell.tsx`)

- Renders `<TopNav />` + `<main className="flex-1">{children}</main>`
- Wraps `ProtectedRoute` children in `router.tsx`

### Auth pages

- No TopNav
- Dark canvas: `min-h-screen bg-background flex items-center justify-center`
- Card: `bg-card rounded-xl p-8 w-full max-w-md` — surface-card-dark on dark, white on light
- "FinanceHub" wordmark above the card in `text-primary`
- Primary CTA: `button-primary` (yellow/black)

### Dashboard page

- Uses `AppShell`
- Body: `max-w-5xl mx-auto px-6 py-8 space-y-6`
- `CurrentUserCard` in a `bg-card rounded-xl` surface
- "Stocks →" nav link as a `button-secondary` styled link

### Stocks page

- Uses `AppShell`
- Sidebar: `w-40 bg-card border-r border-border` — active tab: `border-r-2 border-primary text-foreground font-medium`, inactive: `text-muted-foreground hover:bg-muted/50`
- "Add Transaction" button: `button-primary` (yellow)
- Main content: `bg-background p-6`

### Stock tables

- Price and volume cells: `font-number` + `text-up` / `text-down` based on direction
- Win/Loss list: positive values `text-up`, negative `text-down`
- Holdings table: current value column `font-number`
- Summary cards: large numbers in `font-number text-primary`

---

## 5. shadcn Component Updates (`libs/web-ui`)

| Component                    | Change                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `Button` (primary)           | `bg-primary text-primary-foreground hover:bg-primary/90 rounded-md` — yellow/black |
| `Button` (outline/secondary) | `border-border bg-transparent hover:bg-muted`                                      |
| `Input`                      | `border-border focus-visible:ring-primary h-10 rounded-md`                         |
| `Card`                       | `bg-card rounded-xl border-border`                                                 |

No new shadcn components needed beyond what exists.

---

## 6. File Checklist

| File                                                            | Action                                           |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `libs/web-ui/src/styles/globals.css`                            | Replace tokens, add dark block, import fonts     |
| `libs/web-ui/tailwind.preset.js`                                | Add trading-up, trading-down colors              |
| `libs/web-ui/src/components/ui/button.tsx`                      | Update variant styles                            |
| `libs/web-ui/src/components/ui/input.tsx`                       | Update styles                                    |
| `libs/web-ui/src/components/ui/card.tsx`                        | Update styles                                    |
| `apps/web/src/lib/theme.tsx`                                    | Create ThemeProvider + useTheme                  |
| `apps/web/src/components/top-nav.tsx`                           | Create TopNav                                    |
| `apps/web/src/components/theme-toggle.tsx`                      | Create ThemeToggle                               |
| `apps/web/src/components/app-shell.tsx`                         | Create AppShell                                  |
| `apps/web/src/app/app.tsx`                                      | Wrap with ThemeProvider                          |
| `apps/web/src/app/router.tsx`                                   | Wrap protected routes with AppShell              |
| `apps/web/src/pages/login.page.tsx`                             | Redesign with dark canvas + yellow CTA           |
| `apps/web/src/pages/register.page.tsx`                          | Same as login                                    |
| `apps/web/src/pages/dashboard.page.tsx`                         | Remove inline nav/header, use AppShell chrome    |
| `apps/web/src/pages/stocks.page.tsx`                            | Upgrade sidebar + table number styling           |
| `apps/web/src/features/stocks/components/summary-cards.tsx`     | font-number on large values                      |
| `apps/web/src/features/stocks/components/win-loss-list.tsx`     | text-up / text-down                              |
| `apps/web/src/features/stocks/components/holdings-table.tsx`    | font-number on value cells                       |
| `apps/web/src/features/stocks/components/transaction-table.tsx` | font-number on price cells                       |
| `apps/web/package.json`                                         | Add @fontsource/inter, @fontsource/ibm-plex-mono |

---

## 7. Out of Scope

- No changes to API, database, or auth logic
- No new pages or routes
- No animation tokens
- No trading dashboard (candlestick charts, order books)
- Form validation error/success input states not redesigned (no new flows available to test)
