import type { SummaryDto } from '@finance-hub/shared-api-types';

interface Props {
  data: SummaryDto;
}

function formatNum(n: number): string {
  return Math.round(n).toLocaleString('vi-VN');
}

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <p className="text-xs text-muted-foreground uppercase mb-2">{label}</p>
      <p
        className={`text-xl font-bold ${positive === true ? 'text-green-500' : positive === false ? 'text-red-500' : ''}`}
      >
        {value} ₫
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function SummaryCards({ data }: Props): JSX.Element {
  const netPositive = data.netCashPosition >= 0;
  const pnlPositive = data.realizedPnl >= 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total Invested"
          value={formatNum(data.totalInvested)}
          sub="across all buys"
        />
        <StatCard
          label="Total Received"
          value={formatNum(data.totalReceived)}
          sub="from all sells"
        />
        <StatCard
          label="Net Cash Position"
          value={(netPositive ? '+' : '') + formatNum(data.netCashPosition)}
          sub="received − invested"
          positive={netPositive || undefined}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total Fees Paid"
          value={formatNum(data.totalFeesPaid)}
          sub="buy + sell fees"
        />
        <StatCard label="Total Tax Paid" value={formatNum(data.totalTaxPaid)} sub="TNCN on sells" />
        <StatCard
          label="Realized P&L"
          value={(pnlPositive ? '+' : '') + formatNum(data.realizedPnl)}
          sub="after fees & tax"
          positive={pnlPositive || undefined}
        />
      </div>

      {data.byTicker.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-3 bg-muted text-xs text-muted-foreground uppercase font-medium">
            By Ticker
          </div>
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-muted-foreground uppercase">
                  Ticker
                </th>
                <th className="px-4 py-2 text-right text-xs text-muted-foreground uppercase">
                  Invested (₫)
                </th>
                <th className="px-4 py-2 text-right text-xs text-muted-foreground uppercase">
                  Received (₫)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.byTicker.map((t) => (
                <tr key={t.ticker} className="hover:bg-muted/50">
                  <td className="px-4 py-2 font-semibold">{t.ticker}</td>
                  <td className="px-4 py-2 text-right">{formatNum(t.totalInvested)}</td>
                  <td className="px-4 py-2 text-right">
                    {t.totalReceived > 0 ? formatNum(t.totalReceived) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
