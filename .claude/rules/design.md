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
