import { useState } from 'react';
import { Button } from '@finance-hub/web-ui';
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
        <Button onClick={() => setModalOpen(true)}>+ Add Transaction</Button>
      </div>

      <CashStatCards stats={CASH_STATS} />
      <CashChart />
      <CashTransactionTable transactions={CASH_TRANSACTIONS} />

      <AddCashTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
