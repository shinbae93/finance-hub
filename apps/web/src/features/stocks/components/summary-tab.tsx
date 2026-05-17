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
