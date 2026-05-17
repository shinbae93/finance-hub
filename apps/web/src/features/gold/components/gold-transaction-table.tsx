// apps/web/src/features/gold/components/gold-transaction-table.tsx
import type { GoldTransaction } from '../data/fake-gold-data';

function formatVnd(amount: number): string {
  return `₫${amount.toLocaleString('vi-VN')}`;
}

export function GoldTransactionTable({
  transactions,
}: {
  transactions: GoldTransaction[];
}): JSX.Element {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {transactions.length} entries
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Weight (g)</th>
              <th className="px-4 py-2 text-right">Price / g (₫)</th>
              <th className="px-4 py-2 text-right">Total (₫)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr key={tx.id} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-2 text-muted-foreground">{tx.date}</td>
                <td className="px-4 py-2">
                  <span
                    className={`font-medium ${
                      tx.type === 'MUA' ? 'text-trading-up' : 'text-trading-down'
                    }`}
                  >
                    {tx.type === 'MUA' ? 'Mua' : 'Bán'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-number">{tx.weightGrams.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-number">{formatVnd(tx.pricePerGram)}</td>
                <td className="px-4 py-2 text-right font-number font-semibold">
                  {formatVnd(tx.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
