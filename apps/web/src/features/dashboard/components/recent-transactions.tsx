import { Link } from 'react-router-dom';

type TxType = 'MUA' | 'BAN';

interface Transaction {
  id: string;
  date: string;
  stock: string;
  type: TxType;
  qty: number;
  value: number;
}

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '17 May', stock: 'VNM', type: 'MUA', qty: 500, value: 12_400_000 },
  { id: '2', date: '15 May', stock: 'HPG', type: 'BAN', qty: 300, value: -8_200_000 },
  { id: '3', date: '12 May', stock: 'FPT', type: 'MUA', qty: 200, value: 18_600_000 },
  { id: '4', date: '10 May', stock: 'VIC', type: 'BAN', qty: 150, value: -5_100_000 },
  { id: '5', date: '08 May', stock: 'MWG', type: 'MUA', qty: 400, value: 9_800_000 },
];

function formatValue(value: number): string {
  const abs = Math.abs(value).toLocaleString('vi-VN');
  return value >= 0 ? `+₫${abs}` : `-₫${abs}`;
}

export function RecentTransactions(): JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Recent Transactions
        </p>
        <Link to="/stocks" className="text-xs text-[#fcd535] hover:underline">
          View all →
        </Link>
      </div>

      <div className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_64px_64px_100px] gap-2 border-b border-border pb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Date</span>
          <span>Stock</span>
          <span>Type</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Value</span>
        </div>

        {/* Rows */}
        {RECENT_TRANSACTIONS.map((tx, i) => (
          <div
            key={tx.id}
            className={`grid grid-cols-[80px_1fr_64px_64px_100px] items-center gap-2 py-2.5 text-sm ${
              i < RECENT_TRANSACTIONS.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="text-xs text-muted-foreground">{tx.date}</span>
            <span className="font-semibold text-foreground">{tx.stock}</span>
            <span
              className={`text-xs font-semibold ${
                tx.type === 'MUA' ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              {tx.type}
            </span>
            <span className="font-number text-right text-foreground">{tx.qty}</span>
            <span
              className={`font-number text-right text-xs ${
                tx.value >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              }`}
            >
              {formatValue(tx.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
