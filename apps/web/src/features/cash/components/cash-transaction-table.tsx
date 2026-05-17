import type { CashTransaction } from '../data/fake-cash-data';

function TypeBadge({ type }: { type: 'IN' | 'OUT' }) {
  return type === 'IN' ? (
    <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-[#e6faf3] text-trading-up">
      IN
    </span>
  ) : (
    <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-[#fef0f1] text-trading-down">
      OUT
    </span>
  );
}

export function CashTransactionTable({
  transactions,
}: {
  transactions: CashTransaction[];
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
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr key={tx.id} className="transition-colors hover:bg-muted/50">
                <td className="px-4 py-2 text-foreground">{tx.description}</td>
                <td className="px-4 py-2 text-muted-foreground">{tx.date}</td>
                <td className="px-4 py-2">
                  <TypeBadge type={tx.type} />
                </td>
                <td
                  className={`px-4 py-2 text-right font-number font-semibold ${
                    tx.type === 'IN' ? 'text-trading-up' : 'text-trading-down'
                  }`}
                >
                  {tx.type === 'IN' ? '+' : '−'}₫{tx.amount.toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
