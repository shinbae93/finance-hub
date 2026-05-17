// apps/web/src/features/gold/components/gold-stat-cards.tsx
import type { GoldStats } from '../data/fake-gold-data';

function StatCard({
  label,
  value,
  sub,
  valueClass = 'text-foreground',
  subClass = 'text-muted-foreground',
}: {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  subClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-number text-xl font-bold ${valueClass}`}>{value}</p>
      <p className={`mt-1 text-xs ${subClass}`}>{sub}</p>
    </div>
  );
}

function formatVnd(amount: number): string {
  return `₫${amount.toLocaleString('vi-VN')}`;
}

function formatPnl(amount: number): string {
  return `${amount >= 0 ? '+' : '−'}₫${Math.abs(amount).toLocaleString('vi-VN')}`;
}

export function GoldStatCards({ stats }: { stats: GoldStats }): JSX.Element {
  const pctSign = stats.currentVsCostPercent >= 0 ? '▲' : '▼';
  const pctClass =
    stats.currentVsCostPercent > 0
      ? 'text-trading-up'
      : stats.currentVsCostPercent < 0
        ? 'text-trading-down'
        : 'text-muted-foreground';

  const pnlClass = (v: number) =>
    v > 0 ? 'text-trading-up' : v < 0 ? 'text-trading-down' : 'text-foreground';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      <StatCard
        label="Current Value"
        value={formatVnd(stats.currentValue)}
        sub={`${pctSign} ${Math.abs(stats.currentVsCostPercent).toFixed(2)}% vs cost`}
        subClass={pctClass}
      />
      <StatCard
        label="Total Invested"
        value={formatVnd(stats.totalInvested)}
        sub="original buy cost"
      />
      <StatCard label="Sell Revenue" value={formatVnd(stats.sellRevenue)} sub="all-time proceeds" />
      <StatCard
        label="Realized P&L"
        value={formatPnl(stats.realizedPnl)}
        sub="from closed positions"
        valueClass={pnlClass(stats.realizedPnl)}
      />
      <StatCard
        label="Total P&L"
        value={formatPnl(stats.totalPnl)}
        sub="realized + unrealized"
        valueClass={pnlClass(stats.totalPnl)}
      />
    </div>
  );
}
