import type { CashStats } from '../data/fake-cash-data';

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

export function CashStatCards({ stats }: { stats: CashStats }): JSX.Element {
  const momClass =
    stats.momPercent > 0
      ? 'text-trading-up'
      : stats.momPercent < 0
        ? 'text-trading-down'
        : 'text-muted-foreground';
  const momSign = stats.momPercent >= 0 ? '▲' : '▼';

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        label="Total Balance"
        value={formatVnd(stats.totalBalance)}
        sub={`${momSign} ${Math.abs(stats.momPercent)}% vs last month`}
        subClass={momClass}
      />
      <StatCard
        label="In This Month"
        value={`+${formatVnd(stats.inThisMonth)}`}
        sub={`${stats.inCount} deposits`}
        valueClass="text-trading-up"
      />
      <StatCard
        label="Out This Month"
        value={`−${formatVnd(stats.outThisMonth)}`}
        sub={`${stats.outCount} withdrawals`}
        valueClass="text-trading-down"
      />
    </div>
  );
}
