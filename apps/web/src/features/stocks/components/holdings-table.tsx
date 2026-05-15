import type { HoldingsDto } from '@finance-hub/shared-api-types';

interface Props {
  data: HoldingsDto;
}

function formatNum(n: number): string {
  return n.toLocaleString('vi-VN');
}

export function HoldingsTable({ data }: Props): JSX.Element {
  if (data.holdings.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No current holdings.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground uppercase text-xs">
          <tr>
            <th className="px-4 py-2 text-left">Ticker</th>
            <th className="px-4 py-2 text-right">Shares</th>
            <th className="px-4 py-2 text-right">Avg Cost (₫)</th>
            <th className="px-4 py-2 text-right">Total Invested (₫)</th>
            <th className="px-4 py-2 text-right">Total Fees (₫)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.holdings.map((h) => (
            <tr key={h.ticker} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2 font-semibold">{h.ticker}</td>
              <td className="px-4 py-2 text-right">{formatNum(h.shares)}</td>
              <td className="px-4 py-2 text-right">{formatNum(Math.round(h.avgCost))}</td>
              <td className="px-4 py-2 text-right">{formatNum(Math.round(h.totalInvested))}</td>
              <td className="px-4 py-2 text-right text-muted-foreground">
                {formatNum(Math.round(h.totalFeesPaid))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-border bg-muted font-semibold">
          <tr>
            <td className="px-4 py-2" colSpan={3}>
              Total
            </td>
            <td className="px-4 py-2 text-right text-primary">
              {formatNum(Math.round(data.totalInvested))}
            </td>
            <td className="px-4 py-2 text-right text-primary">
              {formatNum(Math.round(data.totalFeesPaid))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
