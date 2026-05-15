import { useState } from 'react';
import type { WinLossDto } from '@finance-hub/shared-api-types';

interface Props {
  data: WinLossDto;
}

function formatNum(n: number): string {
  return n.toLocaleString('vi-VN');
}

function formatPnl(n: number): string {
  return (n >= 0 ? '+' : '') + formatNum(Math.round(n));
}

export function WinLossList({ data }: Props): JSX.Element {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(ticker: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }

  if (data.groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No sell transactions yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {data.groups.map((group) => {
        const isCollapsed = collapsed.has(group.ticker);
        return (
          <div key={group.ticker} className="rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => toggle(group.ticker)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <span className="font-semibold">{group.ticker}</span>
              <span className="flex items-center gap-2">
                <span
                  className={
                    group.totalPnl >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'
                  }
                >
                  {formatPnl(group.totalPnl)} ₫
                </span>
                <span className="text-muted-foreground text-xs">{isCollapsed ? '▶' : '▼'}</span>
              </span>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-6 px-4 py-2 text-xs text-muted-foreground uppercase bg-background">
                  <span>Date</span>
                  <span className="text-right">Volume</span>
                  <span className="text-right">Sell Price</span>
                  <span className="text-right">Avg Cost</span>
                  <span className="text-right">P&L</span>
                  <span className="text-right">Return</span>
                </div>
                {group.sells.map((sell) => (
                  <div
                    key={sell.transactionId}
                    className="grid grid-cols-6 px-4 py-2 text-sm items-center"
                  >
                    <span className="text-muted-foreground">
                      {new Date(sell.tradeDate).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-right">{formatNum(sell.volume)}</span>
                    <span className="text-right">{formatNum(sell.sellPrice)}</span>
                    <span className="text-right">{formatNum(Math.round(sell.avgCost))}</span>
                    <span
                      className={`text-right font-medium ${sell.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {formatPnl(sell.pnl)} ₫
                    </span>
                    <span
                      className={`text-right ${sell.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {sell.returnPct >= 0 ? '+' : ''}
                      {sell.returnPct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase mb-1">Win Rate</p>
          <p
            className={`text-2xl font-bold ${data.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}
          >
            {data.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase mb-1">Total Realized P&L</p>
          <p
            className={`text-2xl font-bold ${data.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            {formatPnl(data.totalPnl)} ₫
          </p>
        </div>
      </div>
    </div>
  );
}
