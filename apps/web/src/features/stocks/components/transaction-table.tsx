import { useState } from 'react';
import type { StockTransactionDto } from '@finance-hub/shared-api-types';
import { useDeleteTransaction } from '../hooks/use-transactions';
import { formatNum as formatNumber } from '../utils/format';

interface Props {
  transactions: StockTransactionDto[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function TransactionTable({ transactions }: Props): JSX.Element {
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (confirmId === id) {
      deleteTransaction(id, {
        onError: () => {
          setConfirmId(null);
          alert('Failed to delete transaction. Please try again.');
        },
      });
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No transactions yet. Add your first one.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground uppercase text-xs">
          <tr>
            <th className="px-3 py-2 text-left">Trade Date</th>
            <th className="px-3 py-2 text-left">Settlement</th>
            <th className="px-3 py-2 text-left">Ticker</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-right">Volume</th>
            <th className="px-3 py-2 text-right">Price</th>
            <th className="px-3 py-2 text-right">Fee</th>
            <th className="px-3 py-2 text-right">Tax</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-3 py-2">{formatDate(tx.tradeDate)}</td>
              <td className="px-3 py-2">{formatDate(tx.settlementDate)}</td>
              <td className="px-3 py-2 font-semibold">{tx.ticker}</td>
              <td className="px-3 py-2">
                <span
                  className={tx.type === 'MUA' ? 'text-up font-medium' : 'text-down font-medium'}
                >
                  {tx.type === 'MUA' ? 'Mua' : 'Bán'}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-number">{formatNumber(tx.volume)}</td>
              <td className="px-3 py-2 text-right font-number">{formatNumber(tx.price)}</td>
              <td className="px-3 py-2 text-right font-number text-muted-foreground">
                {formatNumber(tx.fee)}
              </td>
              <td className="px-3 py-2 text-right font-number text-muted-foreground">
                {formatNumber(tx.tax)}
              </td>
              <td className="px-3 py-2 text-right font-number font-medium">
                {formatNumber(tx.totalAmount)}
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => handleDelete(tx.id)}
                  disabled={isPending}
                  className={`text-xs px-2 py-1 rounded ${
                    confirmId === tx.id
                      ? 'bg-red-500 text-white'
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  {confirmId === tx.id ? 'Confirm' : '✕'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
