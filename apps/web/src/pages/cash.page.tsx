import { useState } from 'react';
import {
  CashStatCards,
  CashChart,
  CashTransactionTable,
  AddCashTransactionModal,
  CASH_STATS,
  CASH_TRANSACTIONS,
} from '../features/cash';

export function CashPage(): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-lg font-semibold text-foreground">Cash</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-[#fcd535] px-4 py-1.5 text-sm font-semibold text-[#181a20] transition-colors hover:bg-[#f0b90b]"
        >
          + Add Transaction
        </button>
      </div>

      <CashStatCards stats={CASH_STATS} />
      <CashChart />
      <CashTransactionTable transactions={CASH_TRANSACTIONS} />

      <AddCashTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
